import type { Request, Response } from "express";
import { MEETING_STATUSES, type MeetingStatus } from "../constants/collaboration";
import { Deal, type IDeal } from "../models/Deal";
import { Meeting, type IMeeting } from "../models/Meeting";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canAccessDeal,
  getAccessibleDealIds,
  getAccessibleDeals,
  getContactableUsers,
  getDealPartyUserIds,
  sameId,
} from "../utils/dealAccess";
import { notify } from "../utils/notify";
import { queryObjectId } from "../utils/queryObjectId";
import { sendResponse } from "../utils/sendResponse";

type Filter = Record<string, unknown>;

function routeId(value: unknown) {
  return typeof value === "string" ? value : "";
}

function findMeetingById(id: string) {
  return Meeting.findById(id)
    .populate("deal", "title stage")
    .populate("organizer", "name email role")
    .populate("attendees", "name email role");
}

async function meetingFilter(req: Request): Promise<Filter> {
  if (req.user?.role === "admin") return {};

  const dealIds = await getAccessibleDealIds(req);
  const or: Filter[] = [{ organizer: req.user?.id }, { attendees: req.user?.id }];
  if (dealIds.length) or.push({ deal: { $in: dealIds } });

  return { $or: or };
}

async function resolveAttendees(req: Request, requested: unknown, deal: IDeal | null) {
  const ids = Array.isArray(requested)
    ? [...new Set(requested.map((item) => String(item)))]
    : [];

  const contactable = await getContactableUsers(req);
  const allowed = new Set(contactable.map((user) => String(user._id)));
  for (const id of ids) {
    if (!allowed.has(id)) {
      throw new ApiError(400, "You can only invite people connected to your deals.");
    }
  }

  const partyIds = await getDealPartyUserIds(deal);
  const finalIds = new Set<string>([req.user?.id ?? "", ...ids, ...partyIds]);
  finalIds.delete("");

  const users = await User.find({
    _id: { $in: [...finalIds] },
    status: "active",
  }).select("_id");

  return users.map((user) => user._id);
}

function canManageMeeting(req: Request, meeting: IMeeting) {
  return req.user?.role === "admin" || sameId(meeting.organizer, req.user?.id);
}

/** GET /api/meetings */
export const listMeetings = asyncHandler(async (req: Request, res: Response) => {
  const filter = await meetingFilter(req);
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const dealId = queryObjectId(req.query.dealId, "deal");

  if ((MEETING_STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (dealId) filter.deal = dealId;

  const meetings = await Meeting.find(filter)
    .populate("deal", "title stage")
    .populate("organizer", "name email role")
    .populate("attendees", "name email role")
    .sort({ startAt: 1 });

  sendResponse(res, 200, "Meetings retrieved.", { meetings });
});

/** GET /api/meetings/options */
export const getMeetingOptions = asyncHandler(async (req: Request, res: Response) => {
  const [deals, users] = await Promise.all([
    getAccessibleDeals(req),
    getContactableUsers(req),
  ]);

  sendResponse(res, 200, "Meeting options retrieved.", { deals, users });
});

/** POST /api/meetings */
export const createMeeting = asyncHandler(async (req: Request, res: Response) => {
  const dealId = typeof req.body.deal === "string" ? req.body.deal : "";
  let deal: IDeal | null = null;

  if (dealId) {
    deal = await Deal.findById(dealId);
    if (!deal) throw new ApiError(404, "Deal not found.");
    if (!(await canAccessDeal(req, deal))) {
      throw new ApiError(403, "You do not have access to this deal.");
    }
  }

  const attendees = await resolveAttendees(req, req.body.attendees, deal);
  const status = (MEETING_STATUSES as readonly string[]).includes(req.body.status)
    ? (req.body.status as MeetingStatus)
    : "scheduled";

  const meeting = await Meeting.create({
    title: req.body.title,
    deal: deal?._id,
    organizer: req.user?.id,
    attendees,
    startAt: new Date(req.body.startAt),
    durationMinutes: req.body.durationMinutes ? Number(req.body.durationMinutes) : 30,
    location: req.body.location || undefined,
    meetingUrl: req.body.meetingUrl || undefined,
    agenda: req.body.agenda || undefined,
    status,
  });

  await Promise.all(
    attendees
      .filter((id) => String(id) !== req.user?.id)
      .map((id) =>
        notify({
          userId: String(id),
          title: "New meeting scheduled",
          message: `${meeting.title} has been scheduled.`,
          type: "meeting",
        }),
      ),
  );

  const populated = await findMeetingById(meeting.id);
  sendResponse(res, 201, "Meeting scheduled.", { meeting: populated });
});

/** GET /api/meetings/:id */
export const getMeeting = asyncHandler(async (req: Request, res: Response) => {
  const rawMeeting = await Meeting.findById(routeId(req.params.id));
  if (!rawMeeting) throw new ApiError(404, "Meeting not found.");

  const role = req.user?.role;
  let visible =
    role === "admin" ||
    sameId(rawMeeting.organizer, req.user?.id) ||
    rawMeeting.attendees.some((attendee) => sameId(attendee, req.user?.id));

  if (!visible && rawMeeting.deal) {
    const deal = await Deal.findById(rawMeeting.deal);
    visible = await canAccessDeal(req, deal);
  }

  if (!visible) throw new ApiError(403, "You do not have access to this meeting.");

  const meeting = await findMeetingById(rawMeeting.id);
  sendResponse(res, 200, "Meeting retrieved.", { meeting });
});

/** PATCH /api/meetings/:id */
export const updateMeeting = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await Meeting.findById(routeId(req.params.id));
  if (!meeting) throw new ApiError(404, "Meeting not found.");
  if (!canManageMeeting(req, meeting)) {
    throw new ApiError(403, "You do not have permission to update this meeting.");
  }

  let deal: IDeal | null = null;
  let dealChanged = false;

  if (req.body.deal !== undefined) {
    const dealId = typeof req.body.deal === "string" ? req.body.deal : "";
    if (dealId) {
      deal = await Deal.findById(dealId);
      if (!deal) throw new ApiError(404, "Deal not found.");
      if (!(await canAccessDeal(req, deal))) {
        throw new ApiError(403, "You do not have access to this deal.");
      }
      meeting.deal = deal._id;
    } else {
      meeting.deal = undefined;
    }
    dealChanged = true;
  } else if (meeting.deal) {
    deal = await Deal.findById(meeting.deal);
  }

  const previousStatus = meeting.status;
  const previousStart = meeting.startAt.getTime();

  if (typeof req.body.title === "string") meeting.title = req.body.title;
  if (req.body.startAt !== undefined) meeting.startAt = new Date(req.body.startAt);
  if (req.body.durationMinutes !== undefined) {
    meeting.durationMinutes = Number(req.body.durationMinutes);
  }
  if (req.body.location !== undefined) meeting.location = req.body.location || undefined;
  if (req.body.meetingUrl !== undefined) meeting.meetingUrl = req.body.meetingUrl || undefined;
  if (req.body.agenda !== undefined) meeting.agenda = req.body.agenda || undefined;
  if (typeof req.body.status === "string") {
    meeting.status = req.body.status as MeetingStatus;
  }
  if (req.body.notes !== undefined) meeting.notes = req.body.notes || undefined;

  if (req.body.attendees !== undefined || dealChanged) {
    const requested =
      req.body.attendees !== undefined
        ? req.body.attendees
        : meeting.attendees.map((id) => String(id));
    meeting.attendees = await resolveAttendees(req, requested, deal);
  }

  await meeting.save();

  const scheduleChanged =
    meeting.status !== previousStatus || meeting.startAt.getTime() !== previousStart;
  if (scheduleChanged) {
    await Promise.all(
      meeting.attendees
        .filter((id) => String(id) !== req.user?.id)
        .map((id) =>
          notify({
            userId: String(id),
            title: "Meeting updated",
            message: `${meeting.title} is now ${meeting.status.replace("_", " ")}.`,
            type: "meeting",
          }),
        ),
    );
  }

  const populated = await findMeetingById(meeting.id);
  sendResponse(res, 200, "Meeting updated.", { meeting: populated });
});

/** DELETE /api/meetings/:id */
export const deleteMeeting = asyncHandler(async (req: Request, res: Response) => {
  const meeting = await Meeting.findById(routeId(req.params.id));
  if (!meeting) throw new ApiError(404, "Meeting not found.");
  if (!canManageMeeting(req, meeting)) {
    throw new ApiError(403, "You do not have permission to delete this meeting.");
  }

  await meeting.deleteOne();
  sendResponse(res, 200, "Meeting deleted.");
});

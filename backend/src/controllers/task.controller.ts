import type { Request, Response } from "express";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "../constants/collaboration";
import { Deal } from "../models/Deal";
import { Task, type ITask } from "../models/Task";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canAccessDeal,
  getAccessibleDealIds,
  getAccessibleDeals,
  sameId,
} from "../utils/dealAccess";
import { notify } from "../utils/notify";
import { queryObjectId } from "../utils/queryObjectId";
import { sendResponse } from "../utils/sendResponse";

type Filter = Record<string, unknown>;

function routeId(value: unknown) {
  return typeof value === "string" ? value : "";
}

function findTaskById(id: string) {
  return Task.findById(id)
    .populate("deal", "title stage")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
}

async function taskFilter(req: Request): Promise<Filter> {
  const role = req.user?.role;

  if (role === "admin") return {};
  if (role === "advisor") {
    const dealIds = await getAccessibleDealIds(req);
    const or: Filter[] = [
      { assignedTo: req.user?.id },
      { createdBy: req.user?.id },
    ];
    if (dealIds.length) or.push({ deal: { $in: dealIds } });
    return { $or: or };
  }

  return { assignedTo: req.user?.id };
}

async function canViewTask(req: Request, task: ITask) {
  const role = req.user?.role;
  if (role === "admin") return true;
  if (sameId(task.assignedTo, req.user?.id) || sameId(task.createdBy, req.user?.id)) {
    return true;
  }
  if (role === "advisor" && task.deal) {
    const deal = await Deal.findById(task.deal);
    return canAccessDeal(req, deal);
  }
  return false;
}

/** GET /api/tasks */
export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const filter = await taskFilter(req);
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const dealId = queryObjectId(req.query.dealId, "deal");

  if ((TASK_STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (dealId) filter.deal = dealId;

  const tasks = await Task.find(filter)
    .populate("deal", "title stage")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ status: 1, dueDate: 1, createdAt: -1 });

  sendResponse(res, 200, "Tasks retrieved.", { tasks });
});

/** GET /api/tasks/summary */
export const getTaskSummary = asyncHandler(async (req: Request, res: Response) => {
  const filter = await taskFilter(req);
  const tasks = await Task.find(filter).select("status dueDate");
  const now = Date.now();

  const summary = {
    total: tasks.length,
    todo: 0,
    in_progress: 0,
    done: 0,
    overdue: 0,
  };

  for (const task of tasks) {
    summary[task.status] += 1;
    if (task.status !== "done" && task.dueDate && task.dueDate.getTime() < now) {
      summary.overdue += 1;
    }
  }

  sendResponse(res, 200, "Task summary retrieved.", { summary });
});

/** GET /api/tasks/options */
export const getTaskOptions = asyncHandler(async (req: Request, res: Response) => {
  const [deals, users] = await Promise.all([
    getAccessibleDeals(req),
    User.find({ status: "active" }).select("name email role").sort({ name: 1 }),
  ]);

  sendResponse(res, 200, "Task options retrieved.", { deals, users });
});

/** POST /api/tasks */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const assignee = await User.findById(req.body.assignedTo);
  if (!assignee || assignee.status !== "active") {
    throw new ApiError(400, "Select an active user to assign this task to.");
  }

  let dealId;
  if (req.body.deal) {
    const deal = await Deal.findById(req.body.deal);
    if (!deal) throw new ApiError(404, "Deal not found.");
    if (!(await canAccessDeal(req, deal))) {
      throw new ApiError(403, "You do not have access to this deal.");
    }
    dealId = deal._id;
  }

  const status = (TASK_STATUSES as readonly string[]).includes(req.body.status)
    ? (req.body.status as TaskStatus)
    : "todo";
  const priority = (TASK_PRIORITIES as readonly string[]).includes(req.body.priority)
    ? (req.body.priority as TaskPriority)
    : "medium";

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || undefined,
    deal: dealId,
    assignedTo: assignee._id,
    createdBy: req.user?.id,
    dueDate: req.body.dueDate || undefined,
    status,
    priority,
    completedAt: status === "done" ? new Date() : undefined,
  });

  if (String(assignee._id) !== req.user?.id) {
    await notify({
      userId: String(assignee._id),
      title: "New task assigned",
      message: `You have been assigned "${task.title}".`,
      type: "task",
    });
  }

  const populated = await findTaskById(task.id);
  sendResponse(res, 201, "Task created.", { task: populated });
});

/** PATCH /api/tasks/:id */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(routeId(req.params.id));
  if (!task) throw new ApiError(404, "Task not found.");
  if (!(await canViewTask(req, task))) {
    throw new ApiError(403, "You do not have access to this task.");
  }

  const role = req.user?.role;
  if (role === "buyer" || role === "seller") {
    const keys = Object.keys(req.body).filter((key) => req.body[key] !== undefined);
    if (keys.some((key) => key !== "status")) {
      throw new ApiError(403, "You can only update the status of this task.");
    }
    if (typeof req.body.status !== "string") {
      throw new ApiError(400, "Choose a task status.");
    }
  }

  if (typeof req.body.title === "string") task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description || undefined;
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || undefined;
  if (typeof req.body.priority === "string") task.priority = req.body.priority as TaskPriority;

  if (req.body.assignedTo !== undefined) {
    const assignee = await User.findById(req.body.assignedTo);
    if (!assignee || assignee.status !== "active") {
      throw new ApiError(400, "Select an active user to assign this task to.");
    }
    task.assignedTo = assignee._id;
  }

  if (req.body.deal !== undefined) {
    if (!req.body.deal) {
      task.deal = undefined;
    } else {
      const deal = await Deal.findById(req.body.deal);
      if (!deal) throw new ApiError(404, "Deal not found.");
      if (!(await canAccessDeal(req, deal))) {
        throw new ApiError(403, "You do not have access to this deal.");
      }
      task.deal = deal._id;
    }
  }

  const previousAssignee = String(task.assignedTo);
  if (typeof req.body.status === "string") {
    task.status = req.body.status as TaskStatus;
    if (task.status === "done") {
      if (!task.completedAt) task.completedAt = new Date();
    } else {
      task.completedAt = undefined;
    }
  }

  await task.save();

  if (String(task.assignedTo) !== previousAssignee && String(task.assignedTo) !== req.user?.id) {
    await notify({
      userId: String(task.assignedTo),
      title: "Task assigned to you",
      message: `You have been assigned "${task.title}".`,
      type: "task",
    });
  }

  const populated = await findTaskById(task.id);
  sendResponse(res, 200, "Task updated.", { task: populated });
});

/** DELETE /api/tasks/:id */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(routeId(req.params.id));
  if (!task) throw new ApiError(404, "Task not found.");

  if (req.user?.role !== "admin" && !sameId(task.createdBy, req.user?.id)) {
    throw new ApiError(403, "You do not have permission to delete this task.");
  }

  await task.deleteOne();
  sendResponse(res, 200, "Task deleted.");
});

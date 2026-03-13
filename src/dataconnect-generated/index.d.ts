import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddCommentToIdeaData {
  comment_insert: Comment_Key;
}

export interface AddCommentToIdeaVariables {
  ideaId: UUIDString;
  content: string;
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateNewTaskData {
  task_insert: Task_Key;
}

export interface CreateNewTaskVariables {
  title: string;
  status: string;
  description?: string | null;
  dueDate?: DateString | null;
  projectId: UUIDString;
}

export interface GetMyTasksData {
  tasks: ({
    id: UUIDString;
    title: string;
    status: string;
    dueDate?: DateString | null;
    project?: {
      name: string;
    };
      assignee?: {
        displayName: string;
      };
  } & Task_Key)[];
}

export interface Idea_Key {
  id: UUIDString;
  __typename?: 'Idea_Key';
}

export interface ListAllProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    owner?: {
      displayName: string;
      email: string;
    };
  } & Project_Key)[];
}

export interface ProjectMembership_Key {
  userId: UUIDString;
  projectId: UUIDString;
  __typename?: 'ProjectMembership_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllProjectsData, undefined>;
  operationName: string;
}
export const listAllProjectsRef: ListAllProjectsRef;

export function listAllProjects(): QueryPromise<ListAllProjectsData, undefined>;
export function listAllProjects(dc: DataConnect): QueryPromise<ListAllProjectsData, undefined>;

interface CreateNewTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
  operationName: string;
}
export const createNewTaskRef: CreateNewTaskRef;

export function createNewTask(vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;
export function createNewTask(dc: DataConnect, vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface GetMyTasksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTasksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyTasksData, undefined>;
  operationName: string;
}
export const getMyTasksRef: GetMyTasksRef;

export function getMyTasks(): QueryPromise<GetMyTasksData, undefined>;
export function getMyTasks(dc: DataConnect): QueryPromise<GetMyTasksData, undefined>;

interface AddCommentToIdeaRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentToIdeaVariables): MutationRef<AddCommentToIdeaData, AddCommentToIdeaVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCommentToIdeaVariables): MutationRef<AddCommentToIdeaData, AddCommentToIdeaVariables>;
  operationName: string;
}
export const addCommentToIdeaRef: AddCommentToIdeaRef;

export function addCommentToIdea(vars: AddCommentToIdeaVariables): MutationPromise<AddCommentToIdeaData, AddCommentToIdeaVariables>;
export function addCommentToIdea(dc: DataConnect, vars: AddCommentToIdeaVariables): MutationPromise<AddCommentToIdeaData, AddCommentToIdeaVariables>;


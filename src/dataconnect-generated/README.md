# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllProjects*](#listallprojects)
  - [*GetMyTasks*](#getmytasks)
- [**Mutations**](#mutations)
  - [*CreateNewTask*](#createnewtask)
  - [*AddCommentToIdea*](#addcommenttoidea)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllProjects
You can execute the `ListAllProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllProjects(): QueryPromise<ListAllProjectsData, undefined>;

interface ListAllProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProjectsData, undefined>;
}
export const listAllProjectsRef: ListAllProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllProjects(dc: DataConnect): QueryPromise<ListAllProjectsData, undefined>;

interface ListAllProjectsRef {
  ...
  (dc: DataConnect): QueryRef<ListAllProjectsData, undefined>;
}
export const listAllProjectsRef: ListAllProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllProjectsRef:
```typescript
const name = listAllProjectsRef.operationName;
console.log(name);
```

### Variables
The `ListAllProjects` query has no variables.
### Return Type
Recall that executing the `ListAllProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllProjectsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAllProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllProjects } from '@dataconnect/generated';


// Call the `listAllProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllProjects();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllProjects(dataConnect);

console.log(data.projects);

// Or, you can use the `Promise` API.
listAllProjects().then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `ListAllProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllProjectsRef } from '@dataconnect/generated';


// Call the `listAllProjectsRef()` function to get a reference to the query.
const ref = listAllProjectsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllProjectsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## GetMyTasks
You can execute the `GetMyTasks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyTasks(): QueryPromise<GetMyTasksData, undefined>;

interface GetMyTasksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTasksData, undefined>;
}
export const getMyTasksRef: GetMyTasksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyTasks(dc: DataConnect): QueryPromise<GetMyTasksData, undefined>;

interface GetMyTasksRef {
  ...
  (dc: DataConnect): QueryRef<GetMyTasksData, undefined>;
}
export const getMyTasksRef: GetMyTasksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyTasksRef:
```typescript
const name = getMyTasksRef.operationName;
console.log(name);
```

### Variables
The `GetMyTasks` query has no variables.
### Return Type
Recall that executing the `GetMyTasks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyTasksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyTasks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyTasks } from '@dataconnect/generated';


// Call the `getMyTasks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyTasks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyTasks(dataConnect);

console.log(data.tasks);

// Or, you can use the `Promise` API.
getMyTasks().then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `GetMyTasks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyTasksRef } from '@dataconnect/generated';


// Call the `getMyTasksRef()` function to get a reference to the query.
const ref = getMyTasksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyTasksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewTask
You can execute the `CreateNewTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewTask(vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface CreateNewTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
}
export const createNewTaskRef: CreateNewTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewTask(dc: DataConnect, vars: CreateNewTaskVariables): MutationPromise<CreateNewTaskData, CreateNewTaskVariables>;

interface CreateNewTaskRef {
  ...
  (dc: DataConnect, vars: CreateNewTaskVariables): MutationRef<CreateNewTaskData, CreateNewTaskVariables>;
}
export const createNewTaskRef: CreateNewTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewTaskRef:
```typescript
const name = createNewTaskRef.operationName;
console.log(name);
```

### Variables
The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewTaskVariables {
  title: string;
  status: string;
  description?: string | null;
  dueDate?: DateString | null;
  projectId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateNewTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewTaskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewTaskData {
  task_insert: Task_Key;
}
```
### Using `CreateNewTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewTask, CreateNewTaskVariables } from '@dataconnect/generated';

// The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`:
const createNewTaskVars: CreateNewTaskVariables = {
  title: ..., 
  status: ..., 
  description: ..., // optional
  dueDate: ..., // optional
  projectId: ..., 
};

// Call the `createNewTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewTask(createNewTaskVars);
// Variables can be defined inline as well.
const { data } = await createNewTask({ title: ..., status: ..., description: ..., dueDate: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewTask(dataConnect, createNewTaskVars);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
createNewTask(createNewTaskVars).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

### Using `CreateNewTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewTaskRef, CreateNewTaskVariables } from '@dataconnect/generated';

// The `CreateNewTask` mutation requires an argument of type `CreateNewTaskVariables`:
const createNewTaskVars: CreateNewTaskVariables = {
  title: ..., 
  status: ..., 
  description: ..., // optional
  dueDate: ..., // optional
  projectId: ..., 
};

// Call the `createNewTaskRef()` function to get a reference to the mutation.
const ref = createNewTaskRef(createNewTaskVars);
// Variables can be defined inline as well.
const ref = createNewTaskRef({ title: ..., status: ..., description: ..., dueDate: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewTaskRef(dataConnect, createNewTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

## AddCommentToIdea
You can execute the `AddCommentToIdea` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addCommentToIdea(vars: AddCommentToIdeaVariables): MutationPromise<AddCommentToIdeaData, AddCommentToIdeaVariables>;

interface AddCommentToIdeaRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentToIdeaVariables): MutationRef<AddCommentToIdeaData, AddCommentToIdeaVariables>;
}
export const addCommentToIdeaRef: AddCommentToIdeaRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addCommentToIdea(dc: DataConnect, vars: AddCommentToIdeaVariables): MutationPromise<AddCommentToIdeaData, AddCommentToIdeaVariables>;

interface AddCommentToIdeaRef {
  ...
  (dc: DataConnect, vars: AddCommentToIdeaVariables): MutationRef<AddCommentToIdeaData, AddCommentToIdeaVariables>;
}
export const addCommentToIdeaRef: AddCommentToIdeaRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCommentToIdeaRef:
```typescript
const name = addCommentToIdeaRef.operationName;
console.log(name);
```

### Variables
The `AddCommentToIdea` mutation requires an argument of type `AddCommentToIdeaVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCommentToIdeaVariables {
  ideaId: UUIDString;
  content: string;
}
```
### Return Type
Recall that executing the `AddCommentToIdea` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCommentToIdeaData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCommentToIdeaData {
  comment_insert: Comment_Key;
}
```
### Using `AddCommentToIdea`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addCommentToIdea, AddCommentToIdeaVariables } from '@dataconnect/generated';

// The `AddCommentToIdea` mutation requires an argument of type `AddCommentToIdeaVariables`:
const addCommentToIdeaVars: AddCommentToIdeaVariables = {
  ideaId: ..., 
  content: ..., 
};

// Call the `addCommentToIdea()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCommentToIdea(addCommentToIdeaVars);
// Variables can be defined inline as well.
const { data } = await addCommentToIdea({ ideaId: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCommentToIdea(dataConnect, addCommentToIdeaVars);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
addCommentToIdea(addCommentToIdeaVars).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```

### Using `AddCommentToIdea`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCommentToIdeaRef, AddCommentToIdeaVariables } from '@dataconnect/generated';

// The `AddCommentToIdea` mutation requires an argument of type `AddCommentToIdeaVariables`:
const addCommentToIdeaVars: AddCommentToIdeaVariables = {
  ideaId: ..., 
  content: ..., 
};

// Call the `addCommentToIdeaRef()` function to get a reference to the mutation.
const ref = addCommentToIdeaRef(addCommentToIdeaVars);
// Variables can be defined inline as well.
const ref = addCommentToIdeaRef({ ideaId: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCommentToIdeaRef(dataConnect, addCommentToIdeaVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.comment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.comment_insert);
});
```


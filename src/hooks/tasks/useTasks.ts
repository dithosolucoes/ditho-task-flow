
import { createTaskApi } from "./api";
import { createTaskQueries } from "./queries";

export function useTasks() {
  const taskApi = createTaskApi();
  return createTaskQueries(taskApi);
}

import * as Queue from "queue-promise";


export function getTask(task: Function, options: Object = {
  concurrent: 1,
  interval: 5000,
}) : Queue {
  const queue = new Queue(options);
  queue.performTask = function () {
    if (!this.isEmpty) {
      return;
    }
    this.enqueue(task);
    return [];
  };
  return queue;
}
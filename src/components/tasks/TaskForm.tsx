
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types/task";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema, TaskFormValues } from "./form/TaskFormSchema";
import { TitleField, DescriptionField, PriorityField, CategoryField } from "./form/FormFields";
import { DueDateField } from "./form/DueDateField";
import { FormActions } from "./form/FormActions";

type TaskFormProps = {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  defaultCategory?: Task["category"];
};

export function TaskForm({ task, onSubmit, onCancel, defaultCategory = "new" }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      category: task?.category || defaultCategory,
      dueDate: task?.dueDate,
    },
  });

  const handleSubmit = (values: TaskFormValues) => {
    const updatedTask: Task = {
      id: task?.id || uuidv4(),
      title: values.title,
      description: values.description || undefined,
      completed: task?.completed || false,
      priority: values.priority,
      category: values.category,
      dueDate: values.dueDate,
      createdAt: task?.createdAt || new Date(),
    };

    onSubmit(updatedTask);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TitleField />
        <DescriptionField />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriorityField />
          <CategoryField />
        </div>
        
        <DueDateField />

        <FormActions isEditing={!!task} onCancel={onCancel} />
      </form>
    </Form>
  );
}

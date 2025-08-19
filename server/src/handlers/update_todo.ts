import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateTodo(input: UpdateTodoInput): Promise<Todo> {
  try {
    // Update the todo and return the updated record
    const result = await db.update(todosTable)
      .set({
        completed: input.completed
      })
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    // Check if the todo was found and updated
    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo update failed:', error);
    throw error;
  }
}
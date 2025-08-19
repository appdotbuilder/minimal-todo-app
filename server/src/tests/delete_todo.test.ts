import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo to Delete',
        completed: false
      })
      .returning()
      .execute();

    const testTodo = insertResult[0];
    const deleteInput: DeleteTodoInput = {
      id: testTodo.id
    };

    // Delete the todo
    const result = await deleteTodo(deleteInput);

    // Verify success response
    expect(result.success).toBe(true);

    // Verify todo was actually deleted from database
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testTodo.id))
      .execute();

    expect(remainingTodos).toHaveLength(0);
  });

  it('should throw error when deleting non-existent todo', async () => {
    const deleteInput: DeleteTodoInput = {
      id: 999 // Non-existent ID
    };

    // Should throw an error
    await expect(deleteTodo(deleteInput)).rejects.toThrow(/Todo with id 999 not found/i);
  });

  it('should not affect other todos when deleting one todo', async () => {
    // Create multiple test todos
    const insertResults = await db.insert(todosTable)
      .values([
        { title: 'First Todo', completed: false },
        { title: 'Second Todo', completed: true },
        { title: 'Third Todo', completed: false }
      ])
      .returning()
      .execute();

    const todoToDelete = insertResults[1]; // Delete the middle one
    const deleteInput: DeleteTodoInput = {
      id: todoToDelete.id
    };

    // Delete one todo
    const result = await deleteTodo(deleteInput);
    expect(result.success).toBe(true);

    // Verify only the target todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    
    // Verify the correct todos remain
    const remainingIds = remainingTodos.map(todo => todo.id);
    expect(remainingIds).toContain(insertResults[0].id);
    expect(remainingIds).toContain(insertResults[2].id);
    expect(remainingIds).not.toContain(todoToDelete.id);
  });

  it('should handle deletion of completed todo', async () => {
    // Create a completed todo
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Completed Todo to Delete',
        completed: true
      })
      .returning()
      .execute();

    const completedTodo = insertResult[0];
    const deleteInput: DeleteTodoInput = {
      id: completedTodo.id
    };

    // Delete the completed todo
    const result = await deleteTodo(deleteInput);

    // Verify success
    expect(result.success).toBe(true);

    // Verify todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, completedTodo.id))
      .execute();

    expect(remainingTodos).toHaveLength(0);
  });

  it('should handle deletion of todo with long title', async () => {
    // Create a todo with maximum length title
    const longTitle = 'A'.repeat(255);
    const insertResult = await db.insert(todosTable)
      .values({
        title: longTitle,
        completed: false
      })
      .returning()
      .execute();

    const longTitleTodo = insertResult[0];
    const deleteInput: DeleteTodoInput = {
      id: longTitleTodo.id
    };

    // Delete the todo
    const result = await deleteTodo(deleteInput);

    // Verify success
    expect(result.success).toBe(true);

    // Verify todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, longTitleTodo.id))
      .execute();

    expect(remainingTodos).toHaveLength(0);
  });
});
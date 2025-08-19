import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo completion status to true', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo to completed
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await updateTodo(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Test Todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at).toEqual(createdTodo.created_at);
  });

  it('should update todo completion status to false', async () => {
    // Create a completed todo first
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Completed Todo',
        completed: true
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo to not completed
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: false
    };

    const result = await updateTodo(updateInput);

    // Verify the result
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Completed Todo');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated todo in database', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Database Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    // Update the todo
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    await updateTodo(updateInput);

    // Query the database to verify the update was persisted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].id).toEqual(createdTodo.id);
    expect(todos[0].title).toEqual('Database Test Todo');
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].created_at).toEqual(createdTodo.created_at);
  });

  it('should throw error when todo does not exist', async () => {
    const nonExistentId = 99999;
    const updateInput: UpdateTodoInput = {
      id: nonExistentId,
      completed: true
    };

    await expect(updateTodo(updateInput)).rejects.toThrow(/Todo with id 99999 not found/i);
  });

  it('should preserve title and created_at when updating', async () => {
    // Create a todo with specific data
    const originalTitle = 'Important Task';
    const insertResult = await db.insert(todosTable)
      .values({
        title: originalTitle,
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];
    const originalCreatedAt = createdTodo.created_at;

    // Update only the completed status
    const updateInput: UpdateTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await updateTodo(updateInput);

    // Verify that title and created_at are preserved
    expect(result.title).toEqual(originalTitle);
    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.completed).toEqual(true);
  });
});
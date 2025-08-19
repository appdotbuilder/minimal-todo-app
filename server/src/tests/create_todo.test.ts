import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Test Todo Task'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo with correct properties', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Todo Task');
    expect(result.completed).toEqual(false); // Default value
    expect(result.id).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(typeof result.id).toBe('number');
    expect(typeof result.title).toBe('string');
    expect(typeof result.completed).toBe('boolean');
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Test Todo Task');
    expect(todos[0].completed).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
    expect(todos[0].id).toEqual(result.id);
  });

  it('should create multiple todos independently', async () => {
    const firstTodo = await createTodo({ title: 'First Todo' });
    const secondTodo = await createTodo({ title: 'Second Todo' });

    expect(firstTodo.id).not.toEqual(secondTodo.id);
    expect(firstTodo.title).toEqual('First Todo');
    expect(secondTodo.title).toEqual('Second Todo');
    expect(firstTodo.completed).toEqual(false);
    expect(secondTodo.completed).toEqual(false);

    // Verify both are saved in database
    const allTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(allTodos).toHaveLength(2);
  });

  it('should handle special characters in title', async () => {
    const specialInput: CreateTodoInput = {
      title: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const result = await createTodo(specialInput);

    expect(result.title).toEqual(specialInput.title);

    // Verify in database
    const savedTodo = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(savedTodo[0].title).toEqual(specialInput.title);
  });

  it('should handle maximum length title', async () => {
    const longTitle = 'A'.repeat(255); // Maximum allowed length
    const longInput: CreateTodoInput = {
      title: longTitle
    };

    const result = await createTodo(longInput);

    expect(result.title).toEqual(longTitle);
    expect(result.title.length).toEqual(255);

    // Verify in database
    const savedTodo = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(savedTodo[0].title).toEqual(longTitle);
  });

  it('should set created_at timestamp correctly', async () => {
    const beforeCreation = new Date();
    const result = await createTodo(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});
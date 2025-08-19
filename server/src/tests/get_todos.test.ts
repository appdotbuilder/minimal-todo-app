import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all todos ordered by creation date (newest first)', async () => {
    // Create multiple todos with different timestamps
    const todo1 = await db.insert(todosTable)
      .values({
        title: 'First Todo',
        completed: false
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const todo2 = await db.insert(todosTable)
      .values({
        title: 'Second Todo',
        completed: true
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const todo3 = await db.insert(todosTable)
      .values({
        title: 'Third Todo',
        completed: false
      })
      .returning()
      .execute();

    const result = await getTodos();

    // Should return all 3 todos
    expect(result).toHaveLength(3);
    
    // Should be ordered by creation date (newest first)
    expect(result[0].title).toEqual('Third Todo');
    expect(result[1].title).toEqual('Second Todo');
    expect(result[2].title).toEqual('First Todo');

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should return todos with correct field types', async () => {
    // Create a test todo
    await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: true
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    
    const todo = result[0];
    expect(typeof todo.id).toBe('number');
    expect(typeof todo.title).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
    expect(todo.created_at).toBeInstanceOf(Date);
    
    // Verify field values
    expect(todo.title).toEqual('Test Todo');
    expect(todo.completed).toBe(true);
    expect(todo.id).toBeDefined();
  });

  it('should handle todos with different completion states', async () => {
    // Create todos with mixed completion states
    await db.insert(todosTable)
      .values([
        { title: 'Completed Todo', completed: true },
        { title: 'Incomplete Todo', completed: false },
        { title: 'Another Completed', completed: true }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    
    // Verify completion states are preserved
    const completedCount = result.filter(todo => todo.completed).length;
    const incompleteCount = result.filter(todo => !todo.completed).length;
    
    expect(completedCount).toBe(2);
    expect(incompleteCount).toBe(1);
    
    // Check specific todos
    const incompleteTodo = result.find(todo => todo.title === 'Incomplete Todo');
    expect(incompleteTodo?.completed).toBe(false);
    
    const completedTodo = result.find(todo => todo.title === 'Completed Todo');
    expect(completedTodo?.completed).toBe(true);
  });

  it('should maintain consistent ordering across multiple calls', async () => {
    // Create multiple todos
    await db.insert(todosTable)
      .values([
        { title: 'Todo A', completed: false },
        { title: 'Todo B', completed: true },
        { title: 'Todo C', completed: false }
      ])
      .execute();

    // Call getTodos multiple times
    const result1 = await getTodos();
    const result2 = await getTodos();

    expect(result1).toHaveLength(3);
    expect(result2).toHaveLength(3);
    
    // Results should be identical
    expect(result1.map(t => t.id)).toEqual(result2.map(t => t.id));
    expect(result1.map(t => t.title)).toEqual(result2.map(t => t.title));
    expect(result1.map(t => t.completed)).toEqual(result2.map(t => t.completed));
  });
});
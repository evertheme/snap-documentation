import { Injectable } from '@angular/core';

import { Todo } from '../models/todo.model';

/**
 * This service is a todo store
 * See {@link Todo} for details about the main data of this store
 */
@Injectable()
export class TodoStore {
    /**
     *  Local array of Todos
     *  See {@link Todo}
     */
    todos: Array<Todo>;

    constructor() {
        let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos') || '[]');
        // Normalize back into classes
        this.todos = persistedTodos.map((todo: { _title: string, completed: Boolean }) => {
            let ret = new Todo(todo._title);
            ret.completed = todo.completed;
            return ret;
        });
    }

    private updateStore() {
        localStorage.setItem('angular2-todos', JSON.stringify(this.todos));
    }

    private getWithCompleted(completed: Boolean) {
        return this.todos.filter((todo: Todo) => todo.completed === completed);
    }

    /**
     *  All the todos are they __completed__ ?
     * @returns {boolean} All completed ?
     */
    allCompleted(): boolean {
        return this.todos.length === this.getCompleted().length;
    }

    /**
     * Set all todos status (completed or not)
     *
     * @example
     * // set all at completed
     * TodoStore.setAllTo(true);
     *
     * @example
     * // set all at not completed
     * TodoStore.setAllTo(false);
     *
     * @param {boolean} completed Status of all todos
     */
    setAllTo(completed: boolean) {
        this.todos.forEach((t: Todo) => t.completed = completed);
        this.updateStore();
    }

    /**
     *  Remove completed todos
     */
    removeCompleted() {
        this.todos = this.getWithCompleted(false);
        this.updateStore();
    }

    /**
     *  Get remaining todos
     * @returns {Array} All remaining todos
     */
    getRemaining() {
        return this.getWithCompleted(false);
    }

    /**
     *  Get all todos
     * @returns {Array} All todos
     */
    getAll() {
        return this.todos;
    }

    /**
     *  Get completed todos
     * @returns {Array} All completed todos
     */
    getCompleted() {
        return this.getWithCompleted(true);
    }

    /**
     *  Toggle completed todo status
     * @param {Todo} todo Todo which change status
     */
    toggleCompletion(todo: Todo) {
        todo.completed = !todo.completed;
        this.updateStore();
    }

    /**
     * Remove todo
     * See {@link Todo}
     * @param {Todo} todo Todo to remove
     */
    remove(todo: Todo) {
        this.todos.splice(this.todos.indexOf(todo), 1);
        this.updateStore();
    }

    /**
     *  Update store
     */
    update() {
        this.updateStore();
    }

    /**
     *  Add todo
     * @param {string} title Title of todo
     */
    add(title: string) {
        this.todos.push(new Todo(title));
        this.updateStore();
    }
}

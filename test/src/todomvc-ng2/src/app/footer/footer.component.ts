import { Component } from '@angular/core';

import { TodoStore } from '../shared/services/todo.store';

import { EmitterService } from '../shared/services/emitter.service';

/**
 * The footer component
 */
@Component({
    selector: 'footer',
    providers: [],
    templateUrl: './footer.component.html'
})
export class FooterComponent {
    /**
     * Local reference of TodoStore
     */
    todoStore: TodoStore;
    /**
     * Local id for EmitterService
     */
    id: string = 'FooterComponent';
    /**
     * Starting filter param
     */
    currentFilter: string = 'all';

    /**
     * The "constructor"
     *
     * @param {TodoStore} todoStore A TodoStore
     */
    constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}

    /**
     * Removes all the completed todos
     */
    removeCompleted() {
		this.todoStore.removeCompleted();
	}

    /**
     * Display only completed todos
     */
    displayCompleted() {
        this.currentFilter = 'completed';
        EmitterService.get(this.id).emit('displayCompleted');
    }

    /**
     * Display only remaining todos
     */
    displayRemaining() {
        this.currentFilter = 'remaining';
        EmitterService.get(this.id).emit('displayRemaining');
    }

    /**
     * Display all todos
     */
    displayAll() {
        this.currentFilter = 'all';
        EmitterService.get(this.id).emit('displayAll');
    }
}

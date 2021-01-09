import { Injectable } from '@angular/core';
import { DomService } from './dom.service';
import {
    ContextMenu,
    GenericContextMenuComponent,
} from '../components/misc/generic-context-menu/generic-context-menu.component';

@Injectable({
    providedIn: 'root',
})
export class ContextMenuService {
    constructor(private domService: DomService) {}

    openMenu(menu: ContextMenu, mouseEvent: MouseEvent) {
        return this.domService.appendComponentTo<GenericContextMenuComponent>(
            'global-overlay-container',
            GenericContextMenuComponent,
            {
                origin: [mouseEvent.clientX, mouseEvent.clientY],
                menu,
            }
        );
    }
}

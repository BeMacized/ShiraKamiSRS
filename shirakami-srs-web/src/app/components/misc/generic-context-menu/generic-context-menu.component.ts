import { Component, ElementRef, HostBinding } from '@angular/core';
import { SafePopupBaseComponent } from '../safe-popup-base/safe-popup-base.component';
import { DomSanitizer } from '@angular/platform-browser';
import { fadeUp } from '../../../utils/animations';

export interface ContextMenu {
    items: ContextMenuContent[];
    hideIcons?: boolean;
}

export type ContextMenuContent = ContextMenuItem | ContextMenuSeparator;

export interface ContextMenuItem {
    type?: 'ITEM';
    text: string;
    icon?: string;
    onClick?: () => void;
}

export interface ContextMenuSeparator {
    type: 'SEPARATOR';
}

@Component({
    selector: 'app-generic-context-menu',
    templateUrl: './generic-context-menu.component.html',
    styleUrls: ['./generic-context-menu.component.scss'],
    animations: [fadeUp('popup')],
})
export class GenericContextMenuComponent extends SafePopupBaseComponent<GenericContextMenuComponent> {
    _menu: ContextMenu;
    _showIcons = true;
    set menu(menu: ContextMenu) {
        this._menu = menu;
        this._showIcons = menu.hideIcons
            ? false
            : !!menu.items.filter(
                  (item) => item.type !== 'SEPARATOR' && !!item.icon
              ).length;
    }

    @HostBinding('@popup') popupAnimation = true;

    constructor(el: ElementRef, sanitizer: DomSanitizer) {
        super(el, sanitizer);
    }

    onClick(item: ContextMenuItem) {
        item.onClick();
        this.__DOM_COMPONENT.remove();
    }
}

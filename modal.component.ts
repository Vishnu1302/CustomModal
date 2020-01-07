// <copyright file="modal.component.ts" company="API Healthcare">
// Copyright © 2017 API Healthcare.  All rights reserved.  Confidential and Proprietary.
// </copyright>

import { Component, OnInit, ContentChild, Input, Renderer2, ElementRef, AfterContentInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ModalButton, ModalRole, ModalButtonState } from './modal.model';
import { IModalContent } from './modal.content';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'wf-modal',
    templateUrl: 'modal.component.html'
})
export class ModalComponent implements OnInit, AfterContentInit, OnDestroy {

    public title: string | (() => string);
    public buttons: ModalButton[] = [new ModalButton('Ok')];
    public visibility = true;  // TODO: make this default to false, only true for testing
    public quickClose = false;
    @ContentChild('modalContent') modalContent: IModalContent;

    public btnModel: QueryList<ElementRef>;
    @ViewChildren('btnModel') set content(content: QueryList<ElementRef>) {
        this.btnModel = content;
    }

    @Input() role: ModalRole = ModalRole.Modal;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {
        this.visibility = false;
    }

    ngOnInit(): void {
        this.renderer.appendChild(document.body, this.elementRef.nativeElement);
    }

    ngAfterContentInit(): void {
        if (this.modalContent) {
            this.title = this.modalContent.title;
            this.buttons = this.modalContent.buttons;
        }
        this.setupModalRole(this.role);
    }

    ngOnDestroy(): void {
        this.renderer.removeChild(document.body, this.elementRef.nativeElement);
    }

    private setupModalRole(role: ModalRole) {
        switch (role.toString().toUpperCase()) {
            case ModalRole.Alert.toString():
                this.quickClose = true;
                break;
            default:
                break;
        }
    }

    public areAnyButtonsEnabled(): boolean {
        return this.buttons.filter(button => button.condition()).length > 0;
    }

    public getTitleValue(title: string | (() => string)): string {
        if (title instanceof Function) {
            return title();
        }
        return title;
    }

    public callDisabled(condition: () => boolean | ModalButtonState) {
        return condition() === ModalButtonState.Disable;
    }

    public callOnClick(onClick: (close: () => void) => void): void {
        onClick(this.close.bind(this));
    }

    /**
     * To set autofocus on any modal button pass 'autoFocus' as class name
     */
    public setAutoFocus() {
        this.btnModel.changes.subscribe(() => {
            if (this.btnModel.length > 0) {
                this.btnModel.forEach((val) => {
                    const classNameArr = val.nativeElement.className.split(' ');
                    if (classNameArr.some(arr => arr === 'autoFocus') ) {
                        val.nativeElement.focus();
                    }
                });
            }
        });
    }

    public open(): void {
        this.visibility = true;
        this.setAutoFocus();
        this.modalContent && this.modalContent.onModalOpen && this.modalContent.onModalOpen();
    }

    public close(): void {
        this.visibility = false;
        this.modalContent && this.modalContent.onModalClose && this.modalContent.onModalClose();
    }
}

// <copyright file="modal.component.spec.ts" company="API Healthcare">
// Copyright © 2019 API Healthcare Corporation.  All rights reserved.  Confidential and Proprietary.
// </copyright>

import { Component, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from './modal.component';
import { ModalButton, ModalRole, ModalButtonState } from './modal.model';
import { IModalContent } from './modal.content';

@Component({
    selector: 'test-component',
    template: '<div class="test"></div>'
})
class TestComponent implements IModalContent {
    public titleVariable = 'test-title';
    public buttonText = 'conditional';
    public title: () => string = () => this.titleVariable;
    public buttons: ModalButton[] = [
        new ModalButton('click', () => { }, () => ModalButtonState.Show),
        new ModalButton('cancel', (close) => { close(); }),
        new ModalButton('close by default'),
        new ModalButton('conditional', () => { }, () => ModalButtonState.Hide),
        new ModalButton(() => this.buttonText, () => { }, () => true, 'test-class'),
        new ModalButton('disabled', () => { }, () => ModalButtonState.Disable, 'disabled-button')
    ];
}

@Component({
    selector: 'modal-test',
    template: '<wf-modal><test-component #modalContent></test-component></wf-modal>'
})
class ModalTestWithComponent { }

@Component({
    selector: 'modal-test',
    template: '<wf-modal><p>No Component</p></wf-modal>'
})
class ModalTestWithNoComponent { }

describe('ModalComponent', () => {
    let component: ModalComponent;
    let fixture: ComponentFixture<ModalTestWithComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ModalComponent, ModalTestWithComponent, ModalTestWithNoComponent, TestComponent]
        }).compileComponents();
    }));

    describe('when modal content is a component', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ModalTestWithComponent);
            component = fixture.debugElement.children[0].componentInstance;
            fixture.detectChanges();
        });
        afterEach(() => {
            document.body.removeChild(fixture.nativeElement);
        });

        it('should indicate that there are buttons', () => {
            expect(component.areAnyButtonsEnabled()).toBe(true);
        });

        describe('open/close', () => {
            it('should toggle visibility to true/false when #open/#close is called', () => {
                expect(component.visibility).toBeFalsy();
                component.open();
                expect(component.visibility).toBeTruthy();
                component.close();
                expect(component.visibility).toBeFalsy();
            });

            it('should call onModalOpen callback on #open if defined', () => {
                component.modalContent.onModalOpen = () => { };
                spyOn(component.modalContent, 'onModalOpen').and.callThrough();
                component.open();
                expect(component.modalContent.onModalOpen).toHaveBeenCalledTimes(1);
            });

            it('should call onModalClose callback on #close if defined', () => {
                component.modalContent.onModalClose = () => { };
                spyOn(component.modalContent, 'onModalClose').and.callThrough();
                component.close();
                expect(component.modalContent.onModalClose).toHaveBeenCalledTimes(1);
            });
        });

        describe('on view init', () => {
            beforeEach(() => {
                component.visibility = true;
                fixture.detectChanges();
            });

            it('should set modalContent @childContent reference to type of IModalContent', () => {
                expect(typeof component.modalContent.title).toEqual('function');
                expect(component.modalContent.buttons.length).toEqual(6);
                const button = component.modalContent.buttons[0];
                expect(typeof button.text).toEqual('string');
                expect(typeof button.onClick).toEqual('function');
                expect(typeof button.condition).toEqual('function');
            });

            it('should get title and buttons from element with #modalContent ref', () => {
                expect(component.buttons.length).toEqual(6);
                expect(component.title).toBeDefined();
            });

            it('should update the title and button text on change detection', () => {
                expect(fixture.debugElement.query(By.css('.modal-title h3')).nativeElement.innerHTML).toEqual('test-title');
                expect(fixture.debugElement.query(By.css('.modal-buttons button:nth-of-type(4)')).nativeElement.innerHTML).toEqual('conditional');
                component.modalContent['titleVariable'] = 'changed-title';
                component.modalContent['buttonText'] = 'changed-button';
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('.modal-title h3')).nativeElement.innerHTML).toEqual('changed-title');
                expect(fixture.debugElement.query(By.css('.modal-buttons button:nth-of-type(4)')).nativeElement.innerHTML).toEqual('changed-button');
            });

            it('should display title if a string', () => {
                component.title = 'test-title-string';
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('.modal-title h3')).nativeElement.innerHTML).toEqual('test-title-string');
            });

            it('should not place element in dom if conditional logic evaluates to ModalButtonState.Hide', () => {
                component.visibility = true;
                fixture.detectChanges();
                expect(component.buttons.length).toEqual(6);
                expect(fixture.debugElement.queryAll(By.css('button')).length).toEqual(5);
            });

            it('should disable button if conditional logic evaluates to ModalButtonState.Disable', () => {
                component.visibility = true;
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('button.disabled-button')).nativeElement.disabled).toBeTruthy();
            });

            it('should set quickClose to true when modal role is of type ALERT', () => {
                expect(component.quickClose).toBeFalsy();
                component.role = ModalRole.Alert;
                component.ngAfterContentInit();
                expect(component.quickClose).toBeTruthy();
            });
        });

        describe('modal button is clicked', () => {
            beforeEach(() => {
                spyOn(component, 'close').and.callThrough();
                spyOn(component.buttons[1], 'onClick').and.callThrough();
                spyOn(component.buttons[2], 'onClick').and.callThrough();
                component.visibility = true;
                fixture.detectChanges();
            });

            it('should call onClick method with #close called as the passed callback', () => {
                fixture.debugElement.query(By.css('button:nth-of-type(2)')).triggerEventHandler('click', null);
                expect(component.buttons[1].onClick).toHaveBeenCalledTimes(1);
                expect(component.close).toHaveBeenCalledTimes(1);
            });

            it('should provide default callback which closes the modal', () => {
                fixture.debugElement.query(By.css('button:nth-of-type(3)')).triggerEventHandler('click', null);
                expect(component.buttons[2].onClick).toHaveBeenCalledTimes(1);
                expect(component.close).toHaveBeenCalledTimes(1);
            });
        });

        describe('optional button parameters', () => {
            it('should add specified styleClass to button if one is provided', () => {
                component.visibility = true;
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('button:nth-of-type(4)')).nativeElement.classList.contains('test-class')).toBeTruthy();
            });
        });
    });

    describe('when modal content is not a component', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(ModalTestWithNoComponent);
            component = fixture.debugElement.children[0].componentInstance;
            fixture.detectChanges();
        });

        describe('on view init', () => {
            it('should set title and buttons to default if there is no #modalContent ref', () => {
                expect(component.title).toBeUndefined();
                expect(component.buttons.length).toEqual(1);
                expect(component.buttons[0].text).toEqual('Ok');
            });

            it('should set modal contents to provided html', () => {
                component.visibility = true;
                fixture.detectChanges();
                expect(fixture.debugElement.queryAll(By.css('p')).length).toEqual(1);
                expect(fixture.debugElement.queryAll(By.css('p'))[0].nativeElement.innerHTML).toEqual('No Component');
            });
        });

        describe('set autofocus', () => {

            beforeEach(() => {
                component.visibility = true;
                spyOn(component, 'areAnyButtonsEnabled').and.returnValue(true);
            });

            it('should set focus to button with autoFocus passed as class', () => {
                component.buttons[1] = new ModalButton('Continue', () => console.log('test'), () => true, 'priority-button autoFocus');
                fixture.detectChanges();
                const focusSpy = spyOn(component.btnModel.last.nativeElement, 'focus');
                component.setAutoFocus();
                (component.btnModel.changes as EventEmitter<any>).emit();
                expect(focusSpy).toHaveBeenCalled();
            });

            it('set autofocus should fail when no button exists', () => {
                component.buttons = [];
                fixture.detectChanges();
                component.setAutoFocus();
                (component.btnModel.changes as EventEmitter<any>).emit();
                expect(component.btnModel.length).toBe(0);
            });
        });
    });

    afterAll(() => {
        component.ngOnDestroy();
    });

});

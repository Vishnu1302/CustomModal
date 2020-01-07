// <copyright file="modal.module.ts" company="API Healthcare">
// Copyright © 2019 API Healthcare Corporation.  All rights reserved.  Confidential and Proprietary.
// </copyright>
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [ModalComponent],
    declarations: [ModalComponent]
})
export class ModalModule { }

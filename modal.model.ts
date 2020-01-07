// <copyright file="modal.model.ts" company="API Healthcare">
// Copyright © 2019 API Healthcare Corporation.  All rights reserved.  Confidential and Proprietary.
// </copyright>

export class ModalButton {
    constructor(
        public text: string | (() => string),
        public onClick: (close?: () => void) => void = close => close(),
        public condition: () => boolean | ModalButtonState = () => true,
        public styleClass?: string
    ) { }
}

export enum ModalRole {
    Alert = <any>'ALERT',
    Modal = <any>'MODAL'
}

export enum ModalButtonState {
    Show = <any>true,
    Hide = <any>false,
    Disable = <any>'DISABLE'
}

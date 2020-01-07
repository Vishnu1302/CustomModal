// <copyright file="modal.content.ts" company="API Healthcare">
// Copyright © 2019 API Healthcare Corporation.  All rights reserved.  Confidential and Proprietary.
// </copyright>

import { ModalButton } from './modal.model';

export interface IModalContent {
  title: string | (() => string);
  buttons: ModalButton[];
  onModalOpen?: () => void;
  onModalClose?: () => void;
}

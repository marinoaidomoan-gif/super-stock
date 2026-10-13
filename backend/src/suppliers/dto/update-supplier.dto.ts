// src/suppliers/dto/update-supplier.dto.ts
//
// Pour modifier un fournisseur : mêmes règles que la création, mais tous les
// champs deviennent facultatifs (PartialType) : on n'envoie que ce qui change.
import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto.js';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
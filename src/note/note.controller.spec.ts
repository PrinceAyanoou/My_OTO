import { Test, TestingModule } from '@nestjs/testing';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import type { Response } from 'express';

describe('NoteController', () => {
  let controller: NoteController;

  const noteServiceMock = {
    createOrUpdate: jest.fn(),
    generateClassSheet: jest.fn(),
    importFromExcel: jest.fn(),
    findByEvaluation: jest.fn(),
    findByApprenant: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteController],
      providers: [{ provide: NoteService, useValue: noteServiceMock }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<NoteController>(NoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création ou mise à jour d’une note', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const dto = {
      Valeur: 15,
      noteSur: 20,
      evaluationId: '22222222-2222-4222-8222-222222222222',
      inscriptionApprenantId: '33333333-3333-4333-8333-333333333333',
      inscriptionAnneeId: '44444444-4444-4444-8444-444444444444',
    };
    const response = { id: 'note-1' };
    noteServiceMock.createOrUpdate.mockResolvedValue(response);

    await expect(controller.createOrUpdate(ecoleId, dto)).resolves.toBe(
      response,
    );
    expect(noteServiceMock.createOrUpdate).toHaveBeenCalledWith(dto, ecoleId);
  });

  it('délègue la génération Excel et configure la réponse', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const classeId = '22222222-2222-4222-8222-222222222222';
    const evaluationId = '33333333-3333-4333-8333-333333333333';
    const setResponseHeaders = jest.fn();
    const response = { set: setResponseHeaders } as unknown as Response;
    const buffer = Buffer.from('xlsx');
    noteServiceMock.generateClassSheet.mockResolvedValue(buffer);

    const result = await controller.exportExcel(
      ecoleId,
      classeId,
      evaluationId,
      response,
    );

    expect(result).toBeInstanceOf(Object);
    expect(noteServiceMock.generateClassSheet).toHaveBeenCalledWith(
      classeId,
      evaluationId,
      ecoleId,
    );
    expect(setResponseHeaders).toHaveBeenCalledWith({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Fiche_de_Notes.xlsx"',
    });
  });

  it('refuse un import Excel sans fichier', async () => {
    await expect(
      controller.importExcel(
        '11111111-1111-4111-8111-111111111111',
        undefined as unknown as Express.Multer.File,
        { evaluationId: '22222222-2222-4222-8222-222222222222', noteSur: 20 },
      ),
    ).rejects.toThrow('Le fichier Excel est obligatoire.');
    expect(noteServiceMock.importFromExcel).not.toHaveBeenCalled();
  });

  it('délègue les recherches de notes', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const evaluationId = '22222222-2222-4222-8222-222222222222';
    const apprenantId = '33333333-3333-4333-8333-333333333333';
    const anneeId = '44444444-4444-4444-8444-444444444444';
    const response = [{ id: 'note-1' }];
    noteServiceMock.findByEvaluation.mockResolvedValue(response);
    noteServiceMock.findByApprenant.mockResolvedValue(response);
    noteServiceMock.findOne.mockResolvedValue(response[0]);

    await expect(
      controller.findByEvaluation(ecoleId, evaluationId),
    ).resolves.toBe(response);
    await expect(
      controller.findByApprenant(ecoleId, apprenantId, anneeId),
    ).resolves.toBe(response);
    await expect(
      controller.findOne(ecoleId, '55555555-5555-4555-8555-555555555555'),
    ).resolves.toBe(response[0]);

    expect(noteServiceMock.findByEvaluation).toHaveBeenCalledWith(
      evaluationId,
      ecoleId,
    );
    expect(noteServiceMock.findByApprenant).toHaveBeenCalledWith(
      apprenantId,
      anneeId,
      ecoleId,
    );
  });

  it('délègue la mise à jour et la suppression', async () => {
    const ecoleId = '11111111-1111-4111-8111-111111111111';
    const noteId = '22222222-2222-4222-8222-222222222222';
    const dto = { Valeur: 18 };
    const response = { id: noteId };
    noteServiceMock.update.mockResolvedValue(response);
    noteServiceMock.remove.mockResolvedValue(response);

    await expect(controller.update(ecoleId, noteId, dto)).resolves.toBe(
      response,
    );
    await expect(controller.remove(ecoleId, noteId)).resolves.toBe(response);
    expect(noteServiceMock.update).toHaveBeenCalledWith(noteId, dto, ecoleId);
    expect(noteServiceMock.remove).toHaveBeenCalledWith(noteId, ecoleId);
  });
});

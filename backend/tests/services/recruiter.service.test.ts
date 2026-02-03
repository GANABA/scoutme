import * as recruiterService from '../../src/services/recruiter.service';
import { createTestUser, createTestRecruiter, cleanDatabase } from '../test-helpers';

describe('Recruiter Service', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  describe('createRecruiterProfile', () => {
    it('should create a new recruiter profile with pending status', async () => {
      const user = await createTestUser('recruiter');

      const recruiterData = {
        fullName: 'Jane Smith',
        organization: 'Test FC',
        country: 'France',
        phone: '+33612345679',
        jobTitle: 'Head Scout',
      };

      const recruiter = await recruiterService.createRecruiterProfile(user.id, recruiterData);

      expect(recruiter).toBeDefined();
      expect(recruiter.fullName).toBe(recruiterData.fullName);
      expect(recruiter.userId).toBe(user.id);
      expect(recruiter.status).toBe('pending');
    });

    it('should throw error if profile already exists', async () => {
      const user = await createTestUser('recruiter');
      await createTestRecruiter(user.id);

      await expect(
        recruiterService.createRecruiterProfile(user.id, {
          fullName: 'Jane Smith',
          organization: 'Test FC',
          country: 'France',
          phone: '+33612345679',
        })
      ).rejects.toThrow('RECRUITER_PROFILE_EXISTS');
    });
  });

  describe('getRecruiterById', () => {
    it('should return recruiter by ID', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id);

      const found = await recruiterService.getRecruiterById(recruiter.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(recruiter.id);
      expect(found.fullName).toBe(recruiter.fullName);
    });

    it('should throw error if recruiter not found', async () => {
      await expect(
        recruiterService.getRecruiterById('non-existent-id')
      ).rejects.toThrow('RECRUITER_NOT_FOUND');
    });
  });

  describe('getRecruiterByUserId', () => {
    it('should return recruiter by user ID', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id);

      const found = await recruiterService.getRecruiterByUserId(user.id);

      expect(found).toBeDefined();
      expect(found.userId).toBe(user.id);
    });

    it('should throw error if profile not found', async () => {
      const user = await createTestUser('recruiter');

      await expect(
        recruiterService.getRecruiterByUserId(user.id)
      ).rejects.toThrow('RECRUITER_PROFILE_NOT_FOUND');
    });
  });

  describe('updateRecruiterProfile', () => {
    it('should update recruiter profile', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id, { fullName: 'Old Name' });

      const updated = await recruiterService.updateRecruiterProfile(recruiter.id, {
        fullName: 'New Name',
        organization: 'New FC',
      });

      expect(updated.fullName).toBe('New Name');
      expect(updated.organization).toBe('New FC');
      expect(updated.country).toBe(recruiter.country);
    });

    it('should throw error if recruiter not found', async () => {
      await expect(
        recruiterService.updateRecruiterProfile('non-existent-id', { fullName: 'Test' })
      ).rejects.toThrow('RECRUITER_NOT_FOUND');
    });
  });

  describe('deleteRecruiterProfile', () => {
    it('should soft delete recruiter (status suspended)', async () => {
      const user = await createTestUser('recruiter');
      const recruiter = await createTestRecruiter(user.id, { status: 'approved' });

      await recruiterService.deleteRecruiterProfile(recruiter.id);

      const deleted = await recruiterService.getRecruiterById(recruiter.id);
      expect(deleted.status).toBe('suspended');
    });

    it('should throw error if recruiter not found', async () => {
      await expect(
        recruiterService.deleteRecruiterProfile('non-existent-id')
      ).rejects.toThrow('RECRUITER_NOT_FOUND');
    });
  });
});

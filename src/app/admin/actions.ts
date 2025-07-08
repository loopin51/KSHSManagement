'use server';

import { seedDatabase } from '@/lib/seed';
import { revalidatePath } from 'next/cache';

export async function handleSeedDatabase() {
  if (process.env.NODE_ENV === 'development') {
    try {
      await seedDatabase();
      // Revalidate paths to show the new data
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/equipments');
      revalidatePath('/admin/rentals');
      revalidatePath('/');
      revalidatePath('/status');
      return { success: true, message: 'Database has been reset and seeded!' };
    } catch (error) {
      console.error('Error seeding database from action:', error);
      return { success: false, message: 'Failed to reset and seed database.' };
    }
  } else {
    return { success: false, message: 'Seeding is only allowed in development.' };
  }
}

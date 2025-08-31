import { DataSource } from 'typeorm';
import { ActivityEntity } from '../../activities/entities/activity.entity';

export class ActivitySeed {
  async run(dataSource: DataSource) {
    const activityRepository = dataSource.getRepository(ActivityEntity);

    const activities = [
      { name: 'Yoga' },
      { name: 'Meditation' },
      { name: 'Reiki' },
      { name: 'Chakra Balancing' },
      { name: 'Journaling' },
      { name: 'Self-Development' },
      { name: 'Green Living' },
      { name: 'Energy Work' },
      { name: 'Energy Healing' },
      { name: 'Sound Healing' },
      { name: 'Sound Therapy' },
      { name: 'Volunteering' },
      { name: 'Breathwork' },
      { name: 'Mindful Eating' },
      { name: 'Nature Walks' },
      { name: 'Affirmations' },
      { name: 'Visualization' },
      { name: 'Gratitude Practice' },
      { name: 'Body Scans' },
      { name: 'Creative Expression' },
      { name: 'Digital Detox' },
      { name: 'Self-Care Rituals' },
      { name: 'Mindful Reading' },
      { name: 'Mindful Movement' },
      { name: 'Service and Volunteering' },
      { name: 'Sleep Hygiene' },
      { name: 'Aromatherapy' },
    ];

    for (const activity of activities) {
      const existingActivity = await activityRepository.findOne({
        where: { name: activity.name },
      });

      if (!existingActivity) {
        await activityRepository.save(activity);
        console.log(`Activity "${activity.name}" created.`);
      } else {
        console.log(`Activity "${activity.name}" already exists. Skipping.`);
      }
    }
  }
}

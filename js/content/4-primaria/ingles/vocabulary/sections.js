import { colors } from '../lib/vocab/colors.js';
import { days } from '../lib/vocab/days.js';
import { months } from '../lib/vocab/months.js';
import { places, surfaces } from '../lib/vocab/places.js';
import { objects } from '../lib/vocab/objects.js';
import { events } from '../lib/vocab/events.js';
import { jobs } from '../lib/vocab/jobs.js';
import { activities } from '../lib/vocab/activities.js';

const byEnglish = (list) => [...list].sort((a, b) => a.en.toLowerCase().localeCompare(b.en.toLowerCase()));

/** The Vocabulary sections, in the order they appear. Days and months keep their natural order; the rest are alphabetical. */
export const sections = [
  { title: 'Colours', words: byEnglish(colors) },
  { title: 'Days', words: days },
  { title: 'Months', words: months },
  { title: 'Places', words: byEnglish(places) },
  { title: 'Furniture', words: byEnglish(surfaces) },
  { title: 'Objects', words: byEnglish(objects) },
  { title: 'Events', words: byEnglish(events) },
  { title: 'Jobs', words: byEnglish(jobs) },
  { title: 'Verbs', words: byEnglish(activities) },
];

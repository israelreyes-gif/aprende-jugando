// Mapa de pantallas de la app: dirección -> pantalla.
// El orden importa solo cuando dos patrones podrían coincidir.
import { route } from './core/router.js';

import { setupScreen } from './features/setup/setup.screen.js';
import { profilesScreen } from './features/profiles/profiles.screen.js';
import { newProfileScreen } from './features/profiles/new-profile.screen.js';
import { editProfileScreen } from './features/profiles/edit-profile.screen.js';
import { parentsScreen, changePinScreen } from './features/parents/parents.screen.js';
import { childStatsScreen } from './features/parents/child-stats.screen.js';
import { subjectStatsScreen } from './features/parents/subject-stats.screen.js';
import { releaseSubjectsScreen } from './features/parents/release/release-subjects.screen.js';
import { releaseTopicsScreen } from './features/parents/release/release-topics.screen.js';
import { coursesScreen } from './features/courses/courses.screen.js';
import { courseScreen } from './features/subjects/course.screen.js';
import { subjectScreen } from './features/subjects/subject.screen.js';
import { studyScreen } from './features/study/study.screen.js';
import { practiceScreen } from './features/practice/practice.screen.js';

export function registerRoutes() {
  route('/setup', setupScreen);
  route('/', profilesScreen);
  route('/new-profile', newProfileScreen);

  route('/parents', parentsScreen);
  route('/parents/pin', changePinScreen);
  route('/parents/:pid', childStatsScreen);
  route('/parents/:pid/stats/:cid/:sid', subjectStatsScreen);
  route('/parents/:pid/release/:cid', releaseSubjectsScreen);
  route('/parents/:pid/release/:cid/:sid', releaseTopicsScreen);

  route('/p/:pid/edit', editProfileScreen);
  route('/p/:pid', coursesScreen);
  route('/p/:pid/c/:cid', courseScreen);
  route('/p/:pid/c/:cid/s/:sid/:tab', subjectScreen);
  route('/p/:pid/c/:cid/s/:sid/study/:tid', studyScreen);
  route('/p/:pid/c/:cid/s/:sid/practice/:tid', practiceScreen);
}

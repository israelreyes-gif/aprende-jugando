import assert from 'node:assert/strict';
const R = new URL('../js', import.meta.url).pathname;
const { COURSES, profileCourse, subjectsOf, SUBJECTS, loadTopics, getCourse } = await import(`${R}/content/registry.js`);
const { courseGroups } = await import(`${R}/features/courses/course-groups.js`);

assert.equal(profileCourse({}).id, '4-primaria'); console.log('✓ sin curso → 4.º por defecto');
assert.equal(profileCourse(null).id, '4-primaria'); console.log('✓ sin perfil → 4.º');
assert.equal(profileCourse({ course_id: '1-primaria' }).id, '1-primaria'); console.log('✓ perfil de 1.º → 1.º');
assert.equal(profileCourse({ course_id: '3-primaria' }).id, '4-primaria'); console.log('✓ curso cerrado → 4.º');
assert.deepEqual(subjectsOf(getCourse('1-primaria')).map((s) => s.id), ['ingles']); console.log('✓ 1.º solo tiene Inglés');
assert.equal(subjectsOf(getCourse('4-primaria')).length, SUBJECTS.length); console.log('✓ 4.º tiene todas');

let g = courseGroups(COURSES, '4-primaria');
assert.equal(g.current.id, '4-primaria'); assert.deepEqual(g.done.map((c) => c.id), ['1-primaria', '2-primaria', '3-primaria']); assert.equal(g.locked.length, 2); console.log('✓ grupos de Alex');
g = courseGroups(COURSES, '1-primaria');
assert.equal(g.current.id, '1-primaria'); assert.equal(g.done.length, 0); assert.equal(g.locked.length, 5); console.log('✓ grupos de 1.º');

assert.deepEqual(await loadTopics('1-primaria', 'ingles'), []); console.log('✓ 1.º Inglés sin temas aún');

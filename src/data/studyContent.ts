import { MODULES_PART_1 } from './modulesPart1';
import { MODULES_PART_2 } from './modulesPart2';
import type { StudyModule } from '../types/study';

export const STUDY_MODULES: StudyModule[] = [...MODULES_PART_1, ...MODULES_PART_2];

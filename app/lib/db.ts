import { User } from './models/User';
import { Case } from './models/Case';

// This file is now a database abstraction layer
// All database operations go through MongoDB via the models

export default { User, Case };
import groupRoutes from './group-routers.js';
import authRoutes from './auth-routers.js';

export default function (app) {
    groupRoutes(app);
    authRoutes(app);
}

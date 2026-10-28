const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.Role)) {
            return res.status(403).json({
                message: 'Access denied. Admin permission required.'
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
module.exports = {
    name: 'guildMemberUpdate',
    execute(oldMember, newMember) {
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
        if (removedRoles.size > 0) {
            logger.info(`Role ${removedRoles.map(r=>r.name)} removed from ${oldMember.displayName}.`)
        };
        const addedRoles = newMember.roles.cache.filter(role=>!oldMember.roles.cache.has(role.id));
        if (addedRoles.size > 0) {
            logger.info(`Role ${addedRoles.map(r=>r.name)} added to ${oldMember.displayName}.`)
        };
    }
}
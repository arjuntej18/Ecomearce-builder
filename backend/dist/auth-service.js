"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateGoogleUser = findOrCreateGoogleUser;
async function findOrCreateGoogleUser(db, googleUser) {
    if (!googleUser.emailVerified) {
        throw new Error("Google email is not verified.");
    }
    const existingByGoogleSub = await db.query(`
      SELECT
        id,
        google_sub,
        email,
        full_name,
        phone,
        role,
        profile_picture
      FROM profiles
      WHERE google_sub = $1
      LIMIT 1
      `, [googleUser.googleSub]);
    if (existingByGoogleSub.rows[0]) {
        const user = existingByGoogleSub.rows[0];
        await db.query(`
      UPDATE profiles
      SET
        email = $2,
        full_name = COALESCE($3, full_name),
        profile_picture = COALESCE($4, profile_picture),
        last_login = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `, [
            user.id,
            googleUser.email,
            googleUser.name,
            googleUser.picture,
        ]);
        return {
            ...user,
            email: googleUser.email,
            full_name: googleUser.name ??
                user.full_name,
            profile_picture: googleUser.picture ??
                user.profile_picture,
        };
    }
    const existingByEmail = await db.query(`
      SELECT
        id,
        google_sub,
        email,
        full_name,
        phone,
        role,
        profile_picture
      FROM profiles
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `, [googleUser.email]);
    if (existingByEmail.rows[0]) {
        const user = existingByEmail.rows[0];
        await db.query(`
      UPDATE profiles
      SET
        google_sub = $2,
        full_name = COALESCE($3, full_name),
        profile_picture = COALESCE($4, profile_picture),
        last_login = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `, [
            user.id,
            googleUser.googleSub,
            googleUser.name,
            googleUser.picture,
        ]);
        return {
            ...user,
            google_sub: googleUser.googleSub,
            full_name: googleUser.name ??
                user.full_name,
            profile_picture: googleUser.picture ??
                user.profile_picture,
        };
    }
    const created = await db.query(`
      INSERT INTO profiles (
        google_sub,
        email,
        full_name,
        profile_picture,
        role,
        last_login
      )
      VALUES ($1, $2, $3, $4, 'customer', NOW())
      RETURNING
        id,
        google_sub,
        email,
        full_name,
        phone,
        role,
        profile_picture,
        last_login
      `, [
        googleUser.googleSub,
        googleUser.email,
        googleUser.name,
        googleUser.picture,
    ]);
    return created.rows[0];
}

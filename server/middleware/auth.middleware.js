const { getAuth } = require('@clerk/express');
const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');

// Protect: verify Clerk session and attach user from Supabase to req
const protect = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return next(new ApiError(401, 'Not authorized. Please sign in.'));
    }

    // Fetch user record from Supabase
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', auth.userId)
      .single();

    // If user doesn't exist yet (webhook may not have fired), auto-create them
    if (!user || error?.code === 'PGRST116') {
      // Get user details from Clerk
      const { clerkClient } = require('@clerk/express');
      let clerkUser = null;
      try {
        clerkUser = await clerkClient.users.getUser(auth.userId);
      } catch (_) {}

      const name = clerkUser
        ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User'
        : 'User';
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || null;
      const phone = clerkUser?.phoneNumbers?.[0]?.phoneNumber?.replace('+91', '') || null;

      const { data: newUser, error: upsertErr } = await supabase
        .from('users')
        .upsert({
          id: auth.userId,
          name,
          email,
          phone,
          role: 'customer',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single();

      if (upsertErr || !newUser) {
        return next(new ApiError(401, 'Could not sync user. Please sign in again.'));
      }
      user = newUser;
    }

    if (!user.is_active) {
      return next(new ApiError(403, 'Your account has been disabled.'));
    }

    req.user = user;
    req.clerkUserId = auth.userId;
    next();
  } catch (err) {
    next(new ApiError(401, 'Authentication failed.'));
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new ApiError(403, 'Admin access required.'));
};

module.exports = { protect, adminOnly };

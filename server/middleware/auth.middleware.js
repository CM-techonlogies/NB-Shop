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

    // If user doesn't exist yet, create them safely
    if (!user || error?.code === 'PGRST116') {
      let name = 'Customer';
      let email = null;
      let phone = null;

      try {
        const { clerkClient } = require('@clerk/express');
        if (clerkClient && clerkClient.users) {
          const clerkUser = await clerkClient.users.getUser(auth.userId);
          if (clerkUser) {
            name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'Customer';
            email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
            phone = clerkUser.phoneNumbers?.[0]?.phoneNumber?.replace('+91', '') || null;
          }
        }
      } catch (clerkErr) {
        console.warn('Could not fetch user details from Clerk:', clerkErr.message);
      }

      const { data: newUser, error: upsertErr } = await supabase
        .from('users')
        .upsert({
          id: auth.userId,
          name: name || 'Customer',
          email: email || null,
          phone: phone || null,
          role: 'customer',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single();

      if (upsertErr) {
        console.warn('User upsert fallback:', upsertErr.message);
        user = {
          id: auth.userId,
          name: name || 'Customer',
          email: email || null,
          phone: phone || null,
          role: 'customer',
          is_active: true
        };
      } else {
        user = newUser;
      }
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

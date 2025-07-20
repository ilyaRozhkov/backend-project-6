// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .get('/users/:id/edit', (req, reply) => {
      const { id } = req.params;
      const { user } = req;

      if (!user || Number(id) !== user.id) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('users'));
      } else {
        reply.render('users/edit', { user });
      }

      return reply;
    })
    .patch('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const { user } = req;

      if (!user || Number(id) !== user.id) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('users'));
        return;
      }

      const newUser = new app.objection.models.user();
      newUser.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        const modifiedUser = await app.objection.models.user.query().findById(id);
        await modifiedUser.$query().patchAndFetch({
          email: validUser.email,
          first_name: validUser.firstName,
          last_name: validUser.lastName,
          password_digest: validUser.passwordDigest,
        });
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('users'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user, errors: data });
      }

      // eslint-disable-next-line consistent-return
      return reply;
    })
    .delete('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const { user } = req;

      if (!user || Number(id) !== user.id) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('users'));
        return;
      }

      try {
        await app.objection.models.user.query().deleteById(id);
        req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect('/');
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
      }

      // eslint-disable-next-line consistent-return
      return reply;
    });
};

import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      const statuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { statuses });
      return reply;
    }))
    .get('/statuses/new', { name: 'newStatus' }, app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      reply.render('statuses/new');
      return reply;
    }))
    .get('/statuses/:id/edit', app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      const status = await app.objection.models.taskStatus.query().findById(req.params.id);
      if (!status) {
        req.flash('error', i18next.t('flash.statuses.error'));
        return reply.redirect('/');
      }

      reply.render('statuses/edit', { status });
      return reply;
    }))
    .post('/statuses', app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      const status = new app.objection.models.taskStatus();
      status.$set(req.body.data);
      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render(app.reverse('newStatus'), { status, errors: data });
      }

      return reply;
    }))
    .patch('/statuses/:id', app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      const modifiedStatus = await app.objection.models.taskStatus.query()
        .findById(req.params.id);

      if (!modifiedStatus) {
        req.flash('error', i18next.t('flash.edit.error'));
        return reply.redirect('/');
      }

      const status = new app.objection.models.taskStatus();
      status.$set(req.body.data);

      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await modifiedStatus.$query().patchAndFetch({ name: validStatus.name });
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status: modifiedStatus, errors: data });
      }

      return reply;
    }))
    .delete('/statuses/:id', app.fp.authenticate('page', async (req, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }

      if (!user) {
        req.flash('error', i18next.t('flash.authError'));
        return reply.redirect('/');
      }

      try {
        await app.objection.models.taskStatus.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
      }

      reply.redirect(app.reverse('statuses'));
      return reply;
    }));
};

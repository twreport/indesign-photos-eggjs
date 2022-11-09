'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/testp', controller.home.downloadImage);
  router.get('/testt', controller.home.testt);
  router.get('/get_current_photo', controller.photo.get_current_photo);
  router.get('/tags', controller.tag.get_tags);
  router.get('/init', controller.home.init);
  router.post('/photos_by_folder_id', controller.folder.photos_by_folder_id);
  router.get('/folders_by_photo_id/:photo_id', controller.folder.folders_by_photo_id);
  router.get('/folders_by_parent_id/:parent_id', controller.folder.folders_by_parent_id);
  router.get('/get_tags_by_photo_id/:photo_id', controller.tag.get_tags_by_photo_id);
  router.get('/get_heir_tree/:folder_id', controller.folder.get_heir_tree);
  router.get('/get_whole_tree', controller.folder.get_whole_tree);

  router.get('/user/:id', controller.user.get_user_by_id);
  router.get('/folders', controller.folder.get_folder_list_by_user_id);
  router.put('/user', controller.user.edit_user);
  router.put('/folder', controller.folder.edit_folder);
  router.delete('/folder/:id', controller.folder.soft_del_folder);

  router.post('/send_photo', controller.photo.receive_photo);
  router.post('/soft_delete_photo', controller.photo.soft_delete_photo);
  router.post('/resume_photo', controller.photo.resume_photo)
  router.post('/get_main_photo', controller.photo.get_main_photo);
  router.post('/photos', controller.photo.select_photos);
  router.post('/deleted_photos', controller.photo.select_garbage_photos);
  router.post('/add_tag', controller.tag.add_tag);
  router.post('/add_tag_photo', controller.tag.add_tag_photo);
  router.post('/photos_by_tag_id', controller.tag.photos_by_tag_id);
  router.post('/batch_assign_tag', controller.tag.batch_assign_tag);
  router.post('/batch_assign_folder', controller.folder.batch_assign_folder);
  router.post('/del_tag_photo', controller.tag.del_tag_photo);
  router.post('/move_photos', controller.folder.move_photos);

  router.post('/batch_delete_photo', controller.photo.batch_delete_photo);
  router.post('/del_tag', controller.tag.del_tag);
  router.post('/folder', controller.folder.add_folder);
  router.post('/assign_photo_2_folder', controller.folder.assign_photo_2_folder);
  router.post('/soft_delete_photo_link_folder', controller.folder.soft_delete_photo_link_folder);
  router.post('/get_ai_tags_of_current_photo', controller.tag.get_ai_tags_of_current_photo);

  router.post('/get_instagram_img_base64', controller.photo.get_instagram_img_base64)
};

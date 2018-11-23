let generateCss = require('../../scripts/utils/generateCss');
let generateJson = require('../../scripts/utils/generateJson');
let prepareIcons = require('../../scripts/utils/prepareIcons');
let extraFromJson = require('../../scripts/utils/extraFromJson');
let detectLicense = require('../../scripts/utils/detectLicense');
let getIconsMap = require('../../scripts/utils/getIconsMap');
let getIconsFromUrl = require('../../scripts/utils/getIconsFromUrl');
let getIconsFromCss = require('../../scripts/utils/getIconsFromCss');
let getSvgs = require('../../scripts/utils/getSvgs');
let copySvgs = require('../../scripts/utils/copySvgs');
let getFonts = require('../../scripts/utils/getFonts');
let copyFonts = require('../../scripts/utils/copyFonts');
let copyLicense = require('../../scripts/utils/copyLicense');
let fs = require('fs-extra');
let path = require('path');

let options = {
  source: path.join(`${__dirname}/node_modules/`, 'openwebicons'),
  name: 'openwebicons',
  class: 'owi',
  prefix: 'owi-',
  className: 'OpenWebIcons',
  title: 'OpenWeb Icons',
  classifiable: true
};

let paths = {
  package: path.join(options.source, 'package.json'),
  css: path.join(options.source, 'css', 'openwebicons-bootstrap.css'),
  fonts: path.join(options.source, 'font'),
  svgs: path.join(options.source, 'font'),
  url: 'https://pfefferle.github.io/openwebicons/icons/',
  dest: __dirname,
  svgsDest: path.join(__dirname, 'icons')
};

let info = extraFromJson(paths.package, ['homepage', 'description', 'version', 'author', 'license']);

options.license = info.license;
options.author = info.author.name;
options.homepage = info.homepage;
// options.description = info.description;
options.version = info.version;
options.fonts = getFonts(paths.fonts);
options.svgs = getSvgs(paths.svgs);

module.exports = function() {
  let iconsMap = getIconsMap(getIconsFromCss(paths.css, 'icon-'));
  getIconsFromUrl(paths.url, function($) {
    let icons = {};

    $('body').children('.container').children('section').each(function(i, element){
      let $section = $(this);
      let category = $section.find('h2').text().trim();
      icons[category] = [];

      let $icons;
      if(category === 'Uncategorized') {
        $icons = $section.find('h3 i');
      } else {
        $icons = $section.find('table i');
      }

      $icons.each(function() {
        let name = $(this).attr('class').replace('openwebicons-', '');
        icons[category].push({
          name: name,
          content: iconsMap[name],
          title: name
        });
      });
    });

    return icons;
  }).then(function(icons){
    options.icons = icons;
    options = prepareIcons(options);
    generateCss(paths.dest, options.name, options);
    generateJson(paths.dest, options.className, options);
    copyFonts(paths.dest, paths.fonts, options);
    copySvgs(paths.svgsDest, paths.svgs, options.svgs);
    copyLicense(paths.dest, path.join(options.source, 'License.txt'));
  });
};

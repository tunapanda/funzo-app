#!/usr/bin/env node

/* 
 * USAGE: 
 * Run this script with one or more .json files describing books as its arguments. 
 * The .json files should follow the format:
 *
{
  "id": "CSE",
  "title": "Common Sense Economics",
  "institution": "Some School",
  "encryptionKeyBase": "foobarbaz", // Must match value in environment.js
  "expiration": 20160819,           // YYYYMMDD
  "coverImage": "cover.png",
  "sections": [
    { "title":  "Front Matter",
      "source": "frontmatter.html" }, 
    { "title":  "Preface",
      "source": "00-preface.html" },
    { "title": "Twelve Key Elements of Economics",
      "source": "01-twelve-key-elements-of-economics.html" },
    { "title": "Seven Major Sources of Economic Progress",
      "source": "02-seven-major-sources-of-economic-progress.html" }
  ]
}
 */

/* jshint node: true, esnext: true */
'use strict';

const fs = require('fs-extra');
const process = require('process');
const path = require('path');
const CryptoJS = require("crypto-js");
const options = require('node-options');
const S = require('string');
const rmdir = require('rimraf');
const mkdirp = require('mkdirp');

function buildFromJSON(fn) {
    let book = JSON.parse(fs.readFileSync(fn));
    let bookDir = path.dirname(fn);
		let institution = S(book.institution).slugify().s;
		let permalink = S(book.id).slugify().s + "_" + institution;
    let bookMetadataForPublishing = {
      title:       book.title,
      permalink:   permalink, 
      institution: institution
    };
    if ( opts.dir ) {
      var outdir = opts.dir + "/" 
        + bookMetadataForPublishing.permalink 
    } else {
      var outdir = path.join(
        path.dirname(__dirname),
        "publish",
        bookMetadataForPublishing.permalink
          + "-"
          + bookMetadataForPublishing.institution
            .toLowerCase()
            .replace(/\W+/,'')
          + "-"
          + Date.now(),
        bookMetadataForPublishing.permalink 
      );
    }
    if ( fs.existsSync(outdir) ) {
			if ( opts.force ) {
				rmdir.sync(outdir);
			} else {
				console.log("ERROR: target directory " + outdir + " exists. Move it or run wit --force to delete");
				return 1
			}
    }
    mkdirp.sync(outdir);
      
    bookMetadataForPublishing.sections = [];
    book.sections.forEach(section => {
      let sectionMetadata = {
        title: section.title,
        expiration: book.expiration.toString(),
        institution: book.institution
      }
      let permalink = path.basename(section.source)
      if (typeof(section.source) === "undefined") {
        conole.log("ERROR: No `source` value defined for one or more sections");
        return 1;
      }
      section.source.replace('.html','').replace(/\W+/g,'');  
      bookMetadataForPublishing.sections.push(permalink);
      sectionMetadata.permalink = permalink;
        
      if ( section.source.startsWith("/") ) {
        var sectionFn = section.source;
      } else {
        var sectionFn = path.join(bookDir,section.source);
      }
      let content = fs.readFileSync(
        sectionFn, 
        {encoding: 'binary'}
      );
      
      let encryptionKey = 
        sectionMetadata.institution +
        sectionMetadata.expiration + 
        book.encryptionKeyBase;
      
      sectionMetadata.content = CryptoJS.AES
        .encrypt(content,encryptionKey)
        .toString();
      
      let jsonfn = outdir + "/" + permalink + ".json";
      fs.writeFileSync(jsonfn, JSON.stringify(
        sectionMetadata,
        null, 
        '    '
      ));
    });
    
    let publishedBookFn = outdir+"/book.json";
    fs.writeFileSync(publishedBookFn,JSON.stringify(
      bookMetadataForPublishing, 
      null,
      '    '                       
    ));

    if (typeof(book.coverImage) === "undefined") {
        // TODO: include a base64(?) encoded default image that
        // can be used if something goes wrong here...
        var coverImage = path.join(scriptDir,"default_cover.png");
    } else {
        if ( book.coverImage.startsWith("/") ) {
            var coverImage = book.coverImage;
        } else {
            var coverImage = path.join(bookDir,book.coverImage);
        }
    }
    let coverImage_out = outdir + "/cover.png";
    fs.copySync(coverImage,coverImage_out);
    console.log(outdir+"/");
    return outdir+"/";
}

var opts = {
  "dir": false, 
	"force": false  
}
var cli = options.parse(process.argv.slice(2),opts)
cli.args.forEach(fn => {
    buildFromJSON(fn);
});


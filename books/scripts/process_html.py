#!/usr/bin/python

##
##  This script does initial cleanup of an HTML export of the CSE book from gdocs
##  After cleanup, it will probably need to be imported back into gdocs for manual
##  tweaks.
##
##  Usage: just pass one or more HTML filenames as arguments. 
##         Processed versions are output to `dstpath`, defined below.
##

import argparse
import base64
import os, os.path
import lxml.etree
from lxml.cssselect import CSSSelector
import re
import sys

def usage():
    sys.stderr.write("""
USAGE: {myname} file.html...

Cleans HTML output by Google Docs, outputs cleaned HTML to {dstpath}.

""".format(myname=os.path.basename(sys.argv[0]),dstpath=dstpath))

no_content = ["","&nbsp;","&#160;"," ",None]
remove_tags = ["span","hr"]
remove_tags_if_empty = ["p"]
remove_attrs = ["class","style"]
change_attrs = {
    "NEWclass": "class"
}
force_classes = {
    "h1": "text-center title-heading",
    "h2": "text-center title-subheading",
}
tags_to_tags = {
    "h6": "h3",
}
classes_to_tags = {
    "span.c7": "em",
    "p.c37": "blockquote",
    "span.c59": "em",
    "span.c11": "em",
}

def remove_tag(s):
    parent = s.getparent()
    children = s.getchildren()
    previous = s.getprevious()
    if s.text not in no_content:
        if previous is not None:
            if previous.tail in no_content:
                previous.tail = ""
            previous.tail += s.text
        else:
            if parent.text in no_content:
                parent.text = ""
            parent.text += s.text
    for c in children:
        s.addprevious(c)
    if s.tail not in no_content:
        print "TAIL: %s" % s.tail
        if len(children) > 0:
            append_to = children[-1]
        else:
            append_to = parent
        if append_to.tail in ("","&nbsp;",None):
            append_to.tail = ""
        append_to.tail += s.tail
    parent.remove(s)
 
def has_text(e):
    if e.text not in no_content:
        return True
    for c in e.getiterator():
        if c.text not in no_content:
            return True
    return False
    
def is_empty(e):
    if e.text not in no_content:
        return False
    if len(e.getchildren()) > 0:
        return False
    return True
 
def clean(e):
    for c in e.getchildren():
        clean(c)
        if c.tag in remove_tags:
            remove_tag(c)
        elif c.tag in remove_tags_if_empty and is_empty(c):
            remove_tag(c)
        elif c.tag in tags_to_tags.keys():
            c.tag = tags_to_tags[c.tag]
    for a in remove_attrs:
        if e.attrib.has_key(a):
            del(e.attrib[a])
    for (a,b) in change_attrs.items():
        if e.attrib.has_key(a):
            e.attrib[b] = e.attrib[a]
            del(e.attrib[a])
    if e.tag in force_classes.keys():
        e.set("class",force_classes[e.tag])
    return e 
    
def convert_tags(e):
    for (c,t) in classes_to_tags.items():
        for m in CSSSelector(c)(e):
            mtext = lxml.etree.tostring(m)
            if m.text in no_content:
                continue
            p = m.getprevious()
            n = m.getnext()
            if p is not None and p.tag == t and p.tail in no_content:
                if p.text is None:
                    p.text = ""
                p.text += m.text
                if m.tail is not None:
                    p.tail = m.tail
                m.getparent().remove(m)
            elif n is not None and n.tag == t and m.tail in no_content:
                n.text = m.text + n.text
                m.getparent().remove(m)
            else:
                m.tag = t
            
def remove_page_numbers(h):
    # Assume that any <span> that is the only child of a <p>,
    # and contains only numbers is a page number.
    # (can't rely on css classes, since they appear to be
    # randomly named with each export) 
    # c.f. http://lxml.de/xpathxslt.html#regular-expressions-in-xpath
    regexpNS = "http://exslt.org/regular-expressions"
    for pagenum in h.xpath("//span[parent::p[count(child::*) = 1] and re:test(.,'^[0-9\s]+$')]",namespaces={'re':regexpNS}):
        # TODO: since we actually want to remove the parent <p>
        # element, should probably rework the xpath statement
        # to just get it instead of the <span>. 
        parent = pagenum.getparent()
        parent.getparent().remove(parent)
            
def inline_images(h):
    # Inline images
    print "XXX processing %s" % h
    for img in h.xpath("//img"):
        print "XXX processing %s" % lxml.etree.tostring(img)
        src = img.get("src")
        if src.startswith("data:"):
            continue
        ext = os.path.basename(src).split(os.path.extsep)[-1]
        newSrc = "data:image/%s;base64,%s" % (ext,base64.b64encode(open(os.path.join(os.path.dirname(fn),src),"r").read()))
        img.set("src",newSrc)
        
def anchor_subsections(h,section_id=1,tag="a"):
    # Add subsection anchors
    subsection_num = 0
    for e in h.xpath("//"+tag+"[@data-subsection]"):
        # prev = e.getprevious()
        # if prev is not None and prev.tag == "a" and prev.get("name","").startswith('subsection'):
        #     anchor = prev
        # else:
        #     anchor = e.makeelement("a")
        subsection_num += 1
        sId = "{}-{}".format(section_id,subsection_num)
        e.set("data-subsection",sId)
        e.set("href","#")
        e.set("NEWclass","anchor subsection-anchor subsection-" + sId)
        # e.addprevious(anchor)

def section_setup(h,permalink):
    try:
        p = h.xpath("//a[@data-permalink]")[0]
    except IndexError:
        p = lxml.etree.Element("a")
        p.set("href","#")
        h.insert(0,p)
    p.set("id", permalink)
    p.set("data-permalink",permalink)
    p.set("NEWclass","anchor section-anchor section-" + permalink)


def fix_google_links(h):
    url = 'https://www.google.com/url?q='
    for a in h.xpath("//a[substring(@href,1,{}) = '{}']".format(len(url),url)):
       url = a.attrib["href"].replace(url,"") 
       url = re.sub(r"\&.*$","",url)
       a.attrib["href"] = url
def video_links(h):
    url ='http://www.criticalcommons.org/'
    for a in h.xpath("//a[substring(@href,1,{}) = '{}']".format(len(url),url)):
        a.attrib["target"] = "_blank"
        a.attrib["NEWclass"] = "video_link"
        a.text = "Video: " + a.text + " "
        i = lxml.etree.Element("em")
        i.text = "(requires Internet access)"
        a.append(i)

def fix_footnotes(h,prefix):
    def _fix_footnotes(h,prefix):
        print "A pre: " + lxml.etree.tostring(a)
        newId   = re.sub("^.*?ftnt", prefix, a.get("id"))
        a.set("id",newId)
        newRef   = re.sub("^#.*?ftnt", prefix, a.get("href"))
        a.set("data-ref",newRef)
        a.set("href","#")
        classes = a.get("class",None)
        if classes is None:
            classes = set()
        else:
            classes = set(classes.split(","))
        classes.add("ftnt")
        a.set("NEWclass", ", ".join(classes))
        print "A post: " + lxml.etree.tostring(a) + "\n"
        
    # Previously revised HTML
    for a in CSSSelector(".ftnt")(h):
       _fix_footnotes(a,prefix)
       
    # Unrevised HTML
    for a in h.xpath("//a[substring(@href,1,5) = '#ftnt']"):
       _fix_footnotes(a,prefix)

if len(sys.argv) == 1:
    usage()
    sys.exit()
                
parser = argparse.ArgumentParser(description='Clean up HTML')
parser.add_argument('-s',nargs=1,dest='sectionId',default=False,help='Section ID number')
parser.add_argument('files',nargs="*",help="One or more files to convert")
parser.add_argument('outdir', help='Directory to output processed files', default='../build')
args = parser.parse_args()

if args.outdir.startswith("/"):
    dstpath = args.outdir
else:
    dstpath = os.path.abspath(os.path.join(os.path.dirname(sys.argv[0]),args.outdir))

for fn in args.files:
    if args.sectionId:
        sectionId = args.sectionId
        outfn = os.path.basename(fn)
    else:
        m = re.match(r".*?([0-9]+)[^\w]*(.+)",os.path.basename(fn))
        if m is not None:
            (sectionId,outfn) = m.groups()
            sectionId = int(sectionId)
            outfn = "{:0=2}-{}".format(sectionId,outfn)
        else:
            sys.stderr.write("\nCould not determine section number for {fn}. Either rename the file to something like 1-{fn}, or pass a starting section number with -s.\n".format(fn=fn))
            sys.exit(1)

    permalink = re.sub("\W+","",os.path.basename(outfn).replace(".html",""))
    h = lxml.etree.HTML(open(fn,"r").read()).find("body")
    # Modify and clean up HTML
    remove_page_numbers(h)
    inline_images(h)
    section_setup(h,permalink)
    anchor_subsections(h,sectionId)
    fix_footnotes(h,"sec{}_ftnt".format(sectionId))
    fix_google_links(h)
    video_links(h)
    clean(h)
    h.tag = "div"
    if not os.path.exists(dstpath):
        os.mkdir(dstpath)
    outpath = os.path.join(dstpath,outfn)
    # print "Writing %s" % outpath
    lxml.etree.ElementTree(h).write(outpath,method = "html",pretty_print=True)

#!/usr/bin/env python3

from datetime import datetime
from pathlib import Path
import re
import sys
import time
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

CHANNEL_ID = "UClz3DneoYlccluy4hBlx86Q"
FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "youtube-feed.xml"
ATOM = "{http://www.w3.org/2005/Atom}"
YT = "{http://www.youtube.com/xml/schemas/2015}"
MAX_FEED_BYTES = 1024 * 1024


def recent_uploads(xml):
    feed = ET.fromstring(xml)
    if feed.tag != ATOM + "feed":
        raise ValueError("O YouTube não retornou um feed Atom.")

    videos = {}
    for entry in feed.findall(ATOM + "entry"):
        if entry.findtext(YT + "channelId") != CHANNEL_ID:
            continue
        video_id = entry.findtext(YT + "videoId", "").strip()
        title = entry.findtext(ATOM + "title", "").strip()
        published = entry.findtext(ATOM + "published", "").strip()
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id) or not title:
            continue
        try:
            date = datetime.fromisoformat(published.replace("Z", "+00:00"))
        except ValueError:
            continue
        if date.tzinfo is not None:
            videos[video_id] = (date, title, published)

    if len(videos) < 6:
        raise ValueError("O feed retornou menos de seis vídeos válidos do Slackjeff.")

    ET.register_namespace("", ATOM[1:-1])
    ET.register_namespace("yt", YT[1:-1])
    result = ET.Element(ATOM + "feed")
    ET.SubElement(result, ATOM + "title").text = "Slackjeff"
    latest = sorted(videos.items(), key=lambda item: item[1][0], reverse=True)[:6]
    for video_id, (_, title, published) in latest:
        entry = ET.SubElement(result, ATOM + "entry")
        ET.SubElement(entry, YT + "videoId").text = video_id
        ET.SubElement(entry, ATOM + "title").text = title
        ET.SubElement(entry, ATOM + "published").text = published
    return ET.tostring(result, encoding="utf-8", xml_declaration=True)


def fetch_recent_uploads():
    request = Request(FEED_URL, headers={"Accept": "application/atom+xml, application/xml;q=0.9"})
    for attempt in range(1, 4):
        try:
            with urlopen(request, timeout=15) as response:
                xml = response.read(MAX_FEED_BYTES + 1)
            if len(xml) > MAX_FEED_BYTES:
                raise ValueError("O feed excedeu o tamanho máximo esperado.")
            return recent_uploads(xml)
        except (OSError, ValueError, ET.ParseError) as error:
            print(f"Tentativa {attempt} de 3: {error}", file=sys.stderr)
            if attempt < 3:
                time.sleep(4 * attempt)
    raise SystemExit("Falha ao atualizar o feed. A publicação anterior foi preservada, se houver.")


if __name__ == "__main__":
    xml = fetch_recent_uploads()
    temporary = OUTPUT.with_suffix(".xml.tmp")
    temporary.write_bytes(xml)
    temporary.replace(OUTPUT)
    print("Seis vídeos mais recentes do Slackjeff preparados para publicação.")

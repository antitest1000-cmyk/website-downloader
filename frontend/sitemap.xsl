<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Website Downloader</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #060608;
            color: #ededed;
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          header {
            margin-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 1.5rem;
          }
          h1 {
            font-size: 2rem;
            margin: 0 0 0.5rem 0;
            color: #ffffff;
          }
          p {
            color: #a1a1aa;
            margin: 0;
          }
          .back-link {
            display: inline-block;
            color: #0070f3;
            text-decoration: none;
            margin-bottom: 1rem;
            font-weight: 500;
          }
          .back-link:hover {
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #0d0d10;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          th, td {
            padding: 0.85rem 1.2rem;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
          th {
            background: #141418;
            color: #ffffff;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          tr:hover {
            background: rgba(255, 255, 255, 0.03);
          }
          a {
            color: #3291ff;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            font-variant-numeric: tabular-nums;
            color: #10b981;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="/" class="back-link">&#8592; Back to Website Downloader</a>
          <header>
            <h1>XML Sitemap</h1>
            <p>This is the search-engine and visitor sitemap for <a href="https://get-html.cc.cd/">get-html.cc.cd</a>.</p>
          </header>
          <table>
            <thead>
              <tr>
                <th>Page URL</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td class="priority">
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

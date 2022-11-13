+++
title = "Happy Birthday"
date = 2022-06-27T21:28:00+08:00
lastmod = 2023-07-05T06:31:42+08:00
tags = ["music"]
categories = ["随笔"]
draft = false
+++

<!--more-->

```lilypond
\version "2.22.2"

\header {
  title = "Happy Birthday"
  tagline = ##f    % disable default footer
}

melody = {
  \time 3/4
  \tempo 4=110
  \key c \major
  \partial 4 g8 g
  <c a>4 g c'
  <g, b>2 g8 g
  <g, a>4 g d'
  <c c'>2 g8 g \break
  <c g c' g'>4 e' c'
  <c b> a f'8 f'
  <c g c' e'>4 c' <g, g d'>
  <c g c'>2. \bar "|."
}

\score {
  <<
    \new Staff {
      \clef "treble_8"
      \melody
    }
    \new TabStaff {
      \melody
    }
  >>
  \layout { }
  \midi { }
}
```

{{< figure src="/ox-hugo/birthday.png" >}} <br/>


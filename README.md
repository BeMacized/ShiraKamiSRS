<p align="center">
    <img src="https://github.com/BeMacized/ShiraKamiSRS/raw/develop/docs/resources/logo_banner/Logo%20Banner%20Light.png" width="350">
    <br/>
    <br/>
    Open source, self-hostable SRS for studying Japanese vocabulary.
</p>

<p align="center">
    <a><img alt="Latest Version" src="https://img.shields.io/github/v/tag/BeMacized/ShiraKamiSRS?color=informational&label=version&sort=semver"></a>
    <a><img alt="Production Build Status" src="https://github.com/BeMacized/ShiraKamiSRS/actions/workflows/production-build.yml/badge.svg"/></a>
    <a><img alt="Testing Build Status" src="https://github.com/BeMacized/ShiraKamiSRS/actions/workflows/testing-build.yml/badge.svg"/></a>
    <a href="https://discord.gg/dvsgnxWUr5"><img alt="Discord" src="https://img.shields.io/discord/816313048783388694?color=7289DA&label=chat&logo=discord"></a>
    <a href="https://github.com/BeMacized/ShiraKamiSRS/blob/master/readme/LICENSE"><img alt="License" src="https://img.shields.io/github/license/BeMacized/ShiraKamiSRS"></a>
</p>

This is the main repository for ShiraKamiSRS. It is a self-hostable Spaced Repetition System (SRS) specifically geared towards learning Japanese vocabulary, heavily inspired by [WaniKani](https://wanikani.com/).

Want to get started? A publicly hosted instance is available over at [shirakamisrs.com](https://shirakamisrs.com/)!

**Note:** Currently, ShiraKamiSRS is still in its very early stages. A lot of very basic/obvious functionality is still missing. Check out what is planned [here](#roadmap)!

<p align="center">
    <img src="https://github.com/BeMacized/ShiraKamiSRS/raw/develop/docs/resources/mockup_preview.png" width="900">
</p>

## Features

The main highlights:

- :books: Learning your own vocabulary<br>
  Build your own cards and sets.
- :keyboard: Built-in IME<br>
  For easily typing hiragana and katakana.
- :houses: Completely [self-hostable](https://github.com/BeMacized/ShiraKamiSRS/wiki/Self-Hosting)<br>
  For if you prefer running things on your own server.
- :rocket: [Set repositories](https://github.com/BeMacized/ShiraKamiSRS/wiki/Set-Repositories)<br>
  Easily import pre-built sets. Anyone can host repositories to share sets!
- :safety_vest:	Importing/Exporting sets<br>
  Easily back up your progress, or move your data to a different instance.
- :iphone: Mobile friendly interface<br>
  Do your reviews on the go!
- :waning_crescent_moon: Built-in dark mode<br>
  Join us on the dark side. We have kitties!
  
### Built With

ShiraKamiSRS has been built with [Angular](https://angular.io/) and [NestJS](https://nestjs.com/).
  
## Getting Started

- Just want to use ShiraKamiSRS?<br>Use the public version over at [shirakamisrs.com](https://shirakamisrs.com/)!


- Interested in self-hosting ShiraKamiSRS?<br>[Follow the guide](https://github.com/BeMacized/ShiraKamiSRS/wiki/Self-Hosting).


- Want to host your own set repository?<br>[Read the documentation](https://github.com/BeMacized/ShiraKamiSRS/wiki/Set-Repositories).


- Do you want to contribute to the default set repository?<br>Find it over at the [ShiraKamiSRS Public Set Repository](https://github.com/BeMacized/ShiraKamiSRS-Public).

## Roadmap

Currently, ShiraKamiSRS is still missing a lot of basic features. I probably have more things I still want to do than I could list here, but I do think it is important to list a few major ones so it is known they are still coming:

- User Settings<br>
  Currently there is no way for users to manage their own settings. In the future, users should be able to change their account information such as their email, username, or avatar.
- User Management<br>
  Especially for people who administer their own instance of ShiraKamiSRS, it would be useful to be able to manage their users. 
- Skipping/Ignoring lessons<br>
  Sometimes it would be useful to ignore or skip a lesson, especially when there is some overlap between cards. Currently the only way to do this is to delete the card from your set. 
- User synonyms<br>
  It would be useful if users could add their own synonyms, without having to make their changes part of the card. 
- Bug fixes<br>
  There are still quite a few bugs, some of which I know about and some I don't. 
  
If you have any other features you would like to suggest, or bugs you found that need to be fixed, feel free to [submit an issue](https://github.com/BeMacized/ShiraKamiSRS/issues/new) or come talk over in the [Discord](https://discord.gg/dvsgnxWUr5)!

## Contributing

Do you want to contribute? Great! Additional help is always appreciated, whether it be building card sets for the public set repository, writing documentation, fixing bugs, or even implementing whole new features. If you have any questions, feel free to [submit an issue](https://github.com/BeMacized/ShiraKamiSRS/issues/new) or come talk over in the [Discord](https://discord.gg/dvsgnxWUr5)!

I currently don't really have any contribution guidelines, but I'm sure we can figure it out.

If you are looking to contribute in a technical way, have a look at [Setting up your development environment](https://github.com/BeMacized/ShiraKamiSRS/wiki/Setting-up-your-development-environment).

## License
ShiraKamiSRS is available under the [GNU GPL-3.0](https://github.com/BeMacized/ShiraKamiSRS/blob/develop/LICENSE) license.

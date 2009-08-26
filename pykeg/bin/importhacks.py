#!/usr/bin/env python
#
# Copyright 2009 Mike Wakerly <opensource@hoho.com>
#
# This file is part of the Pykeg package of the Kegbot project.
# For more information on Pykeg or Kegbot, see http://kegbot.org/
#
# Pykeg is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# Pykeg is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Pykeg.  If not, see <http://www.gnu.org/licenses/>.

import os
import sys

_DEBUG = False

SYSTEM_SETTINGS_DIR = "/etc/kegbot"
HOME_DIR = os.environ.get('HOME')
USER_SETTINGS_DIR = os.path.join(HOME_DIR, '.kegbot')

def _Debug(message):
  if _DEBUG:
    print 'importhacks:', message

def _AppendToSysPath(path):
  path = os.path.abspath(path)
  if path not in sys.path:
    _Debug('Adding to sys.path: %s' % path)
    sys.path.append(path)
  else:
    _Debug('Already in sys.path: %s' % path)

def _ExtendSysPath():
  """ Add some paths where we'll look for user settings. """
  # Greatest precedence: $HOME/.kegbot/
  # Next precedence: /etc/kegbot
  for dir in (USER_SETTINGS_DIR, SYSTEM_SETTINGS_DIR):
    _AppendToSysPath(dir)
    if _DEBUG:
      test_settings = os.path.join(dir, 'common_settings.py')
      if os.path.exists(test_settings):
        _Debug('%s exists' % test_settings)
      else:
        _Debug('%s does NOT exist' % test_settings)

  # Also extend the path to pick up the pykeg/ parent dir.
  # TODO(mikey): this may need to be reconsidered when installing from
  # distutils.
  _local_dir = os.path.dirname(sys.modules[__name__].__file__)
  _package_dir = os.path.normpath(os.path.join(_local_dir, '../..'))
  _AppendToSysPath(_package_dir)

  # Add pykeg/external to the path, too.
  _external_dir = os.path.join(_package_dir, 'pykeg', 'external')
  _AppendToSysPath(_external_dir)

def _SetDjangoSettingsEnv(settings='pykeg.settings'):
  """ Set django settings if not set. """
  if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    _Debug('Setting DJANGO_SETTINGS_MODULE=%s' % (settings,))
    os.environ['DJANGO_SETTINGS_MODULE'] = settings

def _FixAll():
  _ExtendSysPath()
  _SetDjangoSettingsEnv()

  if _DEBUG:
    try:
      import pykeg
      pykeg_dir = os.path.dirname(pykeg.__file__)
      _Debug('Pykeg loaded from dir: %s' % pykeg_dir)
    except ImportError:
      print 'Warning: pykeg could not be imported'
    try:
      import pykeg.external
      external_dir = os.path.dirname(pykeg.external.__file__)
      _Debug('Pykeg external loaded from dir: %s' % external_dir)
    except ImportError:
      print 'Warning: pykeg.external could not be imported'
    try:
      import common_settings
      common_dir = os.path.dirname(common_settings.__file__)
      _Debug('common_settings loaded from dir: %s' % common_dir)
    except ImportError:
      print 'Warning: common_settings could not be imported'

if __name__ == '__main__' or os.environ.get('DEBUG_IMPORT_HACKS'):
  # When run as a program, or DEBUG_IMPORT_HACKS is set: print debug info
  _DEBUG = True

_FixAll()
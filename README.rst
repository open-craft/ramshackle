Ramshackle
==========

An Open edX Django plugin application for testing Blockstore in Studio and working
with Blockstore-based content libraries. This is for developers only and deliberately
has a basic UI. It is not intended to evolve into an end-user tool, but to be replaced
by one.

Setup Instructions
------------------

On Open edX Devstack:

1. Clone this repo into your devstack's ``src`` folder::

    git clone git@github.com:open-craft/ramshackle.git

2. Install it into Studio's devstack python environment::

    make studio-shell
    pip install -e /edx/src/ramshackle/

3. Access Ramshackle at http://localhost:18010/ramshackle/

Frontend Development
--------------------

If you want to edit the frontend code:

Within the Studio container, run ``npm install`` and then ``make js-watch``.

Test Instructions
-----------------

Run the tests from the devstack CMS shell (``make studio-shell``) using::

    make -f /edx/src/ramshackle/Makefile validate

License
-------

The code in this repository is licensed under the AGPL 3.0 unless otherwise noted.

Please see ``LICENSE.txt`` for details.

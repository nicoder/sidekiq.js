# Sidekiq.js

Simple, efficient background jobs for Node.js.

Sidekiq is well known in the Ruby community as a fast, friendly
background job framework.  Now we're bringing the same functionality to Node.js.

Wait, Node is async so why do I need Sidekiq.js?  A few reasons:

1. Jobs give you a common pattern for scaling your application's
   work to many machines and processes.  You can create millions
   of Sidekiq jobs and run hundreds of sidekiq processes to process
   them in parallel.
1. Jobs are persisted in Redis and queues monitored via the Web UI.
1. Jobs handle unexpected errors automatically via retry.
1. Jobs can be scheduled far in the future, even months or years.

By default, each sidekiq process will execute up to 25 jobs concurrently.
While Node.js is single-threaded, sidekiq will switch between
jobs while waiting for I/O.

# Installation

All official Sidekiq packages use the @mperham scope.  Any top-level
sidekiq packages are 3rd party and not part of this project.

> npm install @mperham/sidekiq

# Want More?

If there is enough demand for them, I will port Sidekiq Pro
and Sidekiq Enterprise to Sidekiq.js.  If you are interested in buying
them and supporting this project, please email me and let me know: mike
AT contribsys.com.

# Support

If you have problems, please ask on StackOverflow with the `sidekiq`
tag. Open an issue if you think you have found a bug.  Official
documentation is in the GitHub wiki.

# License

Sidekiq.js is licensed under the Gnu LGPLv3 license.
Project members are expected to adhere to the Contributor Convenant v1.4.

# Author

Mike Perham, mike AT contribsys.com, http://www.mikeperham.com

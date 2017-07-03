
string|array|object

string: `hello --who John --message Salut`
array: [`hello`, `--who John`, `--message Salut`]
object: { _: [ `hello` ], who: `John`, message: `Salut` }

string -> object
array  -> object
object -> (merge) object
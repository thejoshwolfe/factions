#!/usr/bin/env python3

import sys
import argparse
import json

def cli():
  parser = argparse.ArgumentParser()
  parser.add_argument("file", help="use '-' for stdin")
  output_group = parser.add_mutually_exclusive_group()
  output_group.add_argument("-o", "--output", help="default is '-', meaning stdout")
  output_group.add_argument("-i", "--in-place", action="store_true")
  args = parser.parse_args()

  input_path = args.file
  if args.output != None:
    output_path = args.output
  elif args.in_place:
    output_path = input_path
  else:
    # stdout
    output_path = "-"

  main(input_path, output_path)

def main(input_path, output_path):
  with open_input_path(input_path) as f:
    allSets = json.load(f)
  with open_output_path(output_path) as f:
    f.write(      '[\n')
    for i, expansion in enumerate(allSets):
      f.write(    '  { "name": %s,\n' % json.dumps(expansion["name"]))
      f.write(    '    "factions": [\n')
      for j, faction in enumerate(expansion["factions"]):
        formatting_stats = get_formatting_stats(faction)
        if "cards" in faction:
          f.write(  '      { "name": %s,\n' % json.dumps(faction["name"]))
          f.write(  '        "cards": [\n')
          for k, card in enumerate(faction["cards"]):
            f.write('          {%s}%s\n' % (format_card(card, formatting_stats), [",", ""][k == len(faction["cards"]) - 1]))
          f.write(  '        ]\n')
          f.write(  '      }%s\n' % [",", ""][j == len(expansion["factions"]) - 1])
        else:
          f.write(  '      { "name": %s }%s\n' % (json.dumps(faction["name"]), [",", ""][j == len(expansion["factions"]) - 1]))
      f.write(    '    ]\n')
      f.write(    '  }%s\n' % [",", ""][i == len(allSets) - 1])
    f.write(      ']\n')

name_order = [
  "name",
  "count",
  "type",
  "power",
  "treasures",
  "rewards",
  "breakpoint",
  "monsters",
  "ability",
]
default_values = {
  "count": 1,
  "ability": "",
}
def format_card(card, formatting_stats):
  longest_name = formatting_stats
  parts = []
  for name in name_order:
    try: value = card[name]
    except KeyError:
      try: value = default_values[name]
      except KeyError: continue

    formatted_value = json.dumps(value)
    padding = ""
    if name == "name":
      padding = " " * (longest_name - len(formatted_value))
    parts.append('%s:%s%s' % (json.dumps(name), formatted_value, padding))
  return ",".join(x for x in parts)

def get_formatting_stats(faction):
  if "cards" not in faction: return 0
  longest_name = 0
  for card in faction["cards"]:
    name_length = len(json.dumps(card["name"]))
    if name_length > longest_name:
      longest_name = name_length
  return longest_name

def open_input_path(input_path):
  if input_path != "-":
    return open(input_path)
  return DontTouchMe(sys.stdin)
def open_output_path(output_path):
  if output_path != "-":
    return open(output_path, "w")
  return DontTouchMe(sys.stdout)

class DontTouchMe:
  def __init__(self, enter_value):
    self.enter_value = enter_value
  def __enter__(self):
    return self.enter_value
  def __exit__(self, *args):
    pass

if __name__ == "__main__":
  cli()

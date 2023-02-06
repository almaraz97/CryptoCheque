import { AddIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import RoundedBox from "../../designSystem/RoundedBox";
import Inspection from "./Inspection";

function ModuleInfo() {
  const [sliderValue, setSliderValue] = useState(100);
  const [showTooltip, setShowTooltip] = useState(false);

  const [value, setValue] = useState("1");

  return (
    <RoundedBox padding={6}>
      <Flex flexWrap={"wrap"} gap={"18px"} direction={"column"}>
        <FormControl>
          <FormLabel noOfLines={1} flexShrink={0}>
            Inspection Period
            <Tooltip
              label="The amount of time the payer has to request a refund"
              aria-label="module tooltip"
              placement="right"
            >
              <QuestionOutlineIcon ml={2} mb={1} />
            </Tooltip>
          </FormLabel>
          <Inspection />
        </FormControl>
        <FormControl mt={3}>
          <FormLabel noOfLines={1} flexShrink={0}>
            Down payment amount
            <Tooltip
              label="The minimum payment required to start work"
              aria-label="module tooltip"
              placement="right"
            >
              <QuestionOutlineIcon ml={2} mb={1} />
            </Tooltip>
          </FormLabel>
          <Slider
            id="slider"
            defaultValue={100}
            min={0}
            max={100}
            onChange={(v) => setSliderValue(v)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            color="brand.200"
            ringColor="brand.200"
            w="80%"
          >
            <SliderMark value={0} mt="1" fontSize="sm">
              0%
            </SliderMark>
            <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
              50%
            </SliderMark>
            <SliderMark value={100} mt="1" ml="-2.5" fontSize="sm">
              100%
            </SliderMark>
            <SliderTrack bg="brand.300">
              <SliderFilledTrack bg="brand.200" />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="brand.200"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${sliderValue}%`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </FormControl>
        <FormControl mt="5">
          <FormLabel noOfLines={1} flexShrink={0}>
            Disputation method
            <Tooltip
              label="Method for resolving payment disputes"
              aria-label="module tooltip"
              placement="right"
            >
              <QuestionOutlineIcon ml={2} mb={1} />
            </Tooltip>
            <RadioGroup onChange={setValue} value={value} ml="2" mt="2">
              <Stack direction="column">
                {/*TODO: figure out correct way to set radio colors*/}
                <Radio
                  colorScheme="brand.200"
                  bgColor={value == "1" ? "brand.200" : "clear"}
                  value="1"
                >
                  Self-serve
                </Radio>
                <Radio
                  colorScheme="brand.200"
                  bgColor={value == "2" ? "brand.200" : "clear"}
                  value="2"
                >
                  Third-party auditor
                </Radio>
                <Radio
                  colorScheme="brand.200"
                  bgColor={value == "3" ? "brand.200" : "clear"}
                  value="3"
                >
                  Kleros
                </Radio>
              </Stack>
            </RadioGroup>
          </FormLabel>
        </FormControl>
        <FormControl>
          <FormLabel noOfLines={1} flexShrink={0}>
            Milestones
            <Tooltip
              label="Break the payment into milestones"
              aria-label="module tooltip"
              placement="right"
            >
              <QuestionOutlineIcon ml={2} mb={1} />
            </Tooltip>
          </FormLabel>
          <IconButton
            variant="outline"
            aria-label="Call Sage"
            size="sm"
            fontSize="15px"
            color="brand.200"
            icon={<AddIcon />}
          />
        </FormControl>
      </Flex>
    </RoundedBox>
  );
}

export default ModuleInfo;

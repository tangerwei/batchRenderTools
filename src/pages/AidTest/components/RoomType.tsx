import { parseApiResponse } from "@/tools/api";
import { Select, SelectProps } from "antd";
import { FC, useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

interface IOptions {
  label: string;
  value: string;
}

const options$ = new BehaviorSubject<IOptions[]>([]);
let loading = false;

const loadOptions = async (apiUrl: string, apiKey: string) => {
  if (loading) {
    return;
  }
  loading = true;
  const roomResponse = await fetch(`${apiUrl}/sd_params/options/room`, {
    headers: {
      "aid-api-key": apiKey,
    },
  });
  const roomJson = await roomResponse.json();
  // 使用 parseApiResponse 解析数据并简化选项
  const styleOptions = parseApiResponse<IOptions[]>(roomJson);
  options$.next(styleOptions);
};

interface RoomTypeSelectProps extends SelectProps{
  apiUrl: string;
  apiKey: string;
}

const RoomTypeSelect: FC<RoomTypeSelectProps> = ({
  apiUrl,
  apiKey,
  ...resProps
}) => {
  const [options, setOptions] = useState<IOptions[]>([]);

  useEffect(() => {
    const subscription = options$.subscribe((data) => {
      setOptions(data);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if(apiUrl && apiKey){
        loadOptions(apiUrl, apiKey);
    }
  }, [apiUrl, apiKey]);

  return <Select {...resProps} options={options} />;
};

export default RoomTypeSelect;

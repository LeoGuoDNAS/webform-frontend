import React from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  'Street 1': string;
  'Street 2'?: string;  // The ? indicates it's optional
  'Street 3'?: string;
  'Street 4'?: string;
  'City': string;
  'State': string;
  'Zip': number;
}

export default function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const onSubmit = (data: FormData) => console.log(data);
  console.log(errors);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="Street 1" {...register("Street 1", {required: true})} />
      <input type="text" placeholder="Street 2" {...register} />
      <input type="text" placeholder="Street 3" {...register("Street 3", {})} />
      <input type="text" placeholder="Street 4" {...register("Street 4", {})} />
      <input type="text" placeholder="City" {...register("City", {required: true})} />
      <input type="text" placeholder="State" {...register("State", {required: true})} />
      <input type="number" placeholder="Zip" {...register("Zip", {required: true})} />

      <input type="submit" />
    </form>
  );
}